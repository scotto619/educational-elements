import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DAILY_MATH_CHALLENGES,
  DAILY_MATH_CHALLENGE_STRANDS,
  DAILY_MATH_CHALLENGE_TAGS
} from './data/dailyChallenges';

const DEFAULT_ASSIGNMENT = {
  assignedChallengeId: null,
  customMessage: '',
  dueDate: '',
  assignedAt: null
};

const DailyMathChallenges = ({
  showToast = () => {},
  saveData = () => {},
  loadedData = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [strandFilter, setStrandFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [assignment, setAssignment] = useState(DEFAULT_ASSIGNMENT);
  const [customMessage, setCustomMessage] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [presentationIndex, setPresentationIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const presentationRef = useRef(null);

  const assignedChallengeId = assignment?.assignedChallengeId;

  const selectedChallenge = useMemo(
    () => DAILY_MATH_CHALLENGES.find((challenge) => challenge.id === selectedChallengeId) || null,
    [selectedChallengeId]
  );

  const assignedChallenge = useMemo(
    () => DAILY_MATH_CHALLENGES.find((challenge) => challenge.id === assignedChallengeId) || null,
    [assignedChallengeId]
  );

  useEffect(() => {
    const saved = loadedData?.mathDailyChallenges;
    if (saved) {
      setAssignment({ ...DEFAULT_ASSIGNMENT, ...saved });
      setSelectedChallengeId(saved.assignedChallengeId || '');
      setCustomMessage(saved.customMessage || '');
      setDueDate(saved.dueDate || '');
    } else {
      setAssignment(DEFAULT_ASSIGNMENT);
      setSelectedChallengeId('');
      setCustomMessage('');
      setDueDate('');
    }
  }, [loadedData?.mathDailyChallenges]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const filteredChallenges = useMemo(() => {
    return DAILY_MATH_CHALLENGES.filter((challenge) => {
      const matchesSearch =
        !searchTerm ||
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStrand = strandFilter === 'all' || challenge.strand === strandFilter;
      const matchesTag = tagFilter === 'all' || challenge.tags.includes(tagFilter);

      return matchesSearch && matchesStrand && matchesTag;
    });
  }, [searchTerm, strandFilter, tagFilter]);

  const startPresentation = (challengeId) => {
    const startIndex = Math.max(
      0,
      filteredChallenges.findIndex((challenge) => challenge.id === (challengeId || filteredChallenges[0]?.id))
    );

    if (filteredChallenges.length === 0) {
      showToast('No challenges available with the current filters.', 'error');
      return;
    }

    setPresentationIndex(startIndex);
    setShowPresentation(true);

    requestAnimationFrame(() => {
      if (presentationRef.current?.requestFullscreen) {
        presentationRef.current.requestFullscreen().catch(() => {
          // Ignore fullscreen errors, presentation still works without it
        });
      }
    });
  };

  const closePresentation = () => {
    setShowPresentation(false);
    setPresentationIndex(0);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const navigatePresentation = (direction) => {
    if (filteredChallenges.length === 0) return;

    setPresentationIndex((prev) => {
      const nextIndex = (prev + direction + filteredChallenges.length) % filteredChallenges.length;
      return nextIndex;
    });
  };

  const handleAssign = async () => {
    if (!selectedChallengeId) {
      showToast('Select a challenge to assign before saving.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const updatedAssignment = {
        assignedChallengeId: selectedChallengeId,
        customMessage: customMessage.trim(),
        dueDate: dueDate || '',
        assignedAt: new Date().toISOString()
      };

      const updatedToolkitData = {
        ...(loadedData || {}),
        mathDailyChallenges: updatedAssignment
      };

      await Promise.resolve(saveData({ toolkitData: updatedToolkitData }));

      setAssignment(updatedAssignment);
      showToast('Daily challenge assigned to students!', 'success');
    } catch (error) {
      console.error('Error assigning daily math challenge:', error);
      showToast('Could not assign the challenge. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAssignment = async () => {
    setIsSaving(true);
    try {
      const updatedToolkitData = {
        ...(loadedData || {}),
        mathDailyChallenges: { ...DEFAULT_ASSIGNMENT, clearedAt: new Date().toISOString() }
      };

      await Promise.resolve(saveData({ toolkitData: updatedToolkitData }));

      setAssignment(DEFAULT_ASSIGNMENT);
      setSelectedChallengeId('');
      setCustomMessage('');
      setDueDate('');
      showToast('Daily challenge cleared for students.', 'success');
    } catch (error) {
      console.error('Error clearing daily math challenge:', error);
      showToast('Could not clear the challenge. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const presentationChallenge = filteredChallenges[presentationIndex];

  const formattedDueDate = assignment?.dueDate
    ? new Date(assignment.dueDate).toLocaleDateString()
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" aria-hidden="true"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="uppercase tracking-[0.35em] text-sm text-white/70 font-semibold">Mathematics Spotlight</p>
            <h1 className="text-4xl lg:text-5xl font-black mt-2 mb-4">Daily Math Challenge Studio</h1>
            <p className="text-lg text-white/80 max-w-2xl">
              Launch rich, multi-step problem solving experiences for your class. Browse twenty ready-to-go challenges, present them in fullscreen mode, and assign one directly to the student portal.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => startPresentation(selectedChallengeId || assignedChallengeId)}
              className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              🎯 Launch Presentation Mode
            </button>
            <span className="text-sm text-white/80 text-center">
              Tip: Presentation mode opens fullscreen for big screens. Use ← and → to navigate.
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📌</span>
            Assign to Student Portal
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="challengeSelect" className="block text-sm font-semibold text-slate-600 mb-1">
                Choose a challenge
              </label>
              <select
                id="challengeSelect"
                value={selectedChallengeId}
                onChange={(event) => setSelectedChallengeId(event.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a challenge…</option>
                {DAILY_MATH_CHALLENGES.map((challenge) => (
                  <option key={challenge.id} value={challenge.id}>
                    {challenge.title} • {challenge.strand} • {challenge.estimatedMinutes} min
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dueDate" className="block text-sm font-semibold text-slate-600 mb-1">
                  Optional due date
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="customMessage" className="block text-sm font-semibold text-slate-600 mb-1">
                  Add a message for students
                </label>
                <input
                  id="customMessage"
                  type="text"
                  value={customMessage}
                  onChange={(event) => setCustomMessage(event.target.value)}
                  maxLength={140}
                  placeholder="Example: Focus on presenting clear reasoning in your journal."
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAssign}
                disabled={isSaving || !selectedChallengeId}
                className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? 'Saving…' : 'Assign Challenge'}
              </button>
              <button
                type="button"
                onClick={handleClearAssignment}
                disabled={isSaving || !assignedChallengeId}
                className="bg-slate-100 text-slate-600 font-semibold px-5 py-2 rounded-lg hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-all"
              >
                Clear Assignment
              </button>
              {assignedChallengeId && (
                <span className="text-sm text-slate-500">
                  Last assigned: {new Date(assignment.assignedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold">Current Student View</h3>
            {assignedChallenge ? (
              <>
                <p className="text-sm text-white/80 mt-2">Students see this challenge in their Maths Corner.</p>
                <div className="bg-slate-800/70 rounded-xl p-4 mt-3">
                  <p className="text-sm uppercase tracking-wide text-indigo-300 font-semibold">{assignedChallenge.strand}</p>
                  <h4 className="text-lg font-bold mt-1">{assignedChallenge.title}</h4>
                  <p className="text-sm text-white/80 mt-2">{assignedChallenge.headline}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
                    <span className="bg-indigo-500/60 px-3 py-1 rounded-full">
                      {assignedChallenge.difficulty}
                    </span>
                    <span className="bg-purple-500/60 px-3 py-1 rounded-full">
                      {assignedChallenge.estimatedMinutes} min
                    </span>
                  </div>
                  {assignment?.customMessage && (
                    <p className="mt-4 text-sm text-indigo-200 italic">“{assignment.customMessage}”</p>
                  )}
                  {formattedDueDate && (
                    <p className="mt-2 text-xs text-slate-300">Due: {formattedDueDate}</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-white/70 mt-2">No challenge is currently assigned. Choose one from the list to publish it for students.</p>
            )}
          </div>
          <div className="border-t border-white/10 pt-4 text-xs text-white/70 space-y-2">
            <p className="font-semibold uppercase tracking-widest">Teacher Tips</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use presentation mode on the classroom screen before assigning.</li>
              <li>Encourage students to record their thinking in maths journals.</li>
              <li>Extend early finishers with the built-in extension prompts.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Challenge Library</h2>
            <p className="text-sm text-slate-500">Browse twenty rich tasks. Filter by strand, focus tags, or search keywords.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search challenges</label>
              <input
                id="search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, focus, or description…"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="strandFilter" className="sr-only">Filter by strand</label>
              <select
                id="strandFilter"
                value={strandFilter}
                onChange={(event) => setStrandFilter(event.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All strands</option>
                {DAILY_MATH_CHALLENGE_STRANDS.map((strand) => (
                  <option key={strand} value={strand}>{strand}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="tagFilter" className="sr-only">Filter by focus tag</label>
              <select
                id="tagFilter"
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All focus tags</option>
                {DAILY_MATH_CHALLENGE_TAGS.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredChallenges.map((challenge) => {
            const isAssigned = challenge.id === assignedChallengeId;
            const isSelected = challenge.id === selectedChallengeId;

            return (
              <div
                key={challenge.id}
                className={`border rounded-2xl p-5 h-full flex flex-col gap-4 transition-all hover:shadow-md ${
                  isAssigned ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-200'
                } ${isSelected && !isAssigned ? 'ring-2 ring-indigo-100' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold">{challenge.strand}</p>
                    <h3 className="text-lg font-bold text-slate-800">{challenge.title}</h3>
                    <p className="text-sm text-slate-500 mt-2">{challenge.headline}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs text-slate-500">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{challenge.difficulty}</span>
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">{challenge.estimatedMinutes} min</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {challenge.tags.map((tag) => (
                    <span key={tag} className="bg-slate-100 px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>

                <p className="text-sm text-slate-600 flex-1">{challenge.description}</p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startPresentation(challenge.id)}
                    className="flex-1 bg-slate-900 text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-slate-700 transition-all"
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChallengeId(challenge.id)}
                    className={`flex-1 border text-sm font-semibold px-3 py-2 rounded-lg transition-all ${
                      isSelected ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>

                {isAssigned && (
                  <div className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-2 rounded-lg">
                    ✓ Assigned to students
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg font-semibold mb-2">No challenges match those filters yet.</p>
            <p className="text-sm">Try clearing a filter or searching with different keywords.</p>
          </div>
        )}
      </div>

      {showPresentation && presentationChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 text-white">
          <div
            ref={presentationRef}
            className="w-full h-full flex flex-col"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <div>
                <p className="uppercase tracking-[0.5em] text-xs text-white/60">Daily Math Challenge</p>
                <h2 className="text-3xl font-black mt-2">{presentationChallenge.title}</h2>
                <p className="text-sm text-white/70 mt-2">{presentationChallenge.headline}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">
                  {presentationChallenge.strand}
                </span>
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">
                  {presentationChallenge.difficulty}
                </span>
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">
                  {presentationChallenge.estimatedMinutes} min
                </span>
                <button
                  type="button"
                  onClick={closePresentation}
                  className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <section>
                    <h3 className="text-xl font-bold mb-2">Mission Brief</h3>
                    <p className="text-lg text-white/80 leading-relaxed">{presentationChallenge.description}</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold mb-2">Scenario</h3>
                    <p className="text-white/80 leading-relaxed">{presentationChallenge.scenario}</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold mb-3">Challenge Steps</h3>
                    <ol className="list-decimal list-inside space-y-2 text-white/80">
                      {presentationChallenge.taskSteps.map((step, index) => (
                        <li key={index} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold mb-3">Success Criteria</h3>
                    <ul className="list-disc list-inside space-y-2 text-white/80">
                      {presentationChallenge.successCriteria.map((criterion, index) => (
                        <li key={criterion + index}>{criterion}</li>
                      ))}
                    </ul>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="bg-white/10 rounded-xl p-5">
                    <h3 className="text-lg font-semibold mb-2">Math Talk Prompts</h3>
                    <ul className="list-disc list-inside space-y-2 text-white/80">
                      {presentationChallenge.mathTalkQuestions.map((question, index) => (
                        <li key={question + index}>{question}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="bg-white/10 rounded-xl p-5">
                    <h3 className="text-lg font-semibold mb-2">Materials</h3>
                    <ul className="list-disc list-inside space-y-1 text-white/80">
                      {presentationChallenge.materials.map((material) => (
                        <li key={material}>{material}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="bg-indigo-500/20 rounded-xl p-5 border border-indigo-500/40">
                    <h3 className="text-lg font-semibold mb-2">Extension Idea</h3>
                    <p className="text-white/80 leading-relaxed">{presentationChallenge.extension}</p>
                  </section>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-white/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="text-sm text-white/70">
                <p>Use ← and → keys or the controls to navigate.</p>
                <p>Currently viewing {presentationIndex + 1} of {filteredChallenges.length} challenges.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigatePresentation(-1)}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => navigatePresentation(1)}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold"
                >
                  Next →
                </button>
                <button
                  type="button"
                  onClick={() => startPresentation(filteredChallenges[presentationIndex]?.id)}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold"
                >
                  Restart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isFullscreen) {
                      document.exitFullscreen().catch(() => {});
                    } else if (presentationRef.current?.requestFullscreen) {
                      presentationRef.current.requestFullscreen().catch(() => {});
                    }
                  }}
                  className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200"
                >
                  {isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMathChallenges;
