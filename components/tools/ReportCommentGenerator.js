import React, { useMemo, useState } from 'react';

const criteriaOptions = {
  academic: [
    { value: 'outstanding', label: 'Outstanding progress' },
    { value: 'meeting', label: 'Meeting expectations' },
    { value: 'developing', label: 'Developing skills' },
    { value: 'support', label: 'Needs targeted support' },
  ],
  behaviour: [
    { value: 'excellent', label: 'Consistently respectful' },
    { value: 'positive', label: 'Positive classroom presence' },
    { value: 'reminders', label: 'Requires occasional reminders' },
    { value: 'support', label: 'Needs behaviour support' },
  ],
  effort: [
    { value: 'consistent', label: 'Consistent effort' },
    { value: 'generally', label: 'Generally puts in effort' },
    { value: 'variable', label: 'Effort varies' },
    { value: 'needs', label: 'Needs to increase effort' },
  ],
  engagement: [
    { value: 'enthusiastic', label: 'Highly engaged' },
    { value: 'curious', label: 'Curious and reflective' },
    { value: 'quiet', label: 'Quietly engaged' },
    { value: 'reluctant', label: 'Reluctant at times' },
  ],
};

const strengthOptions = [
  'Works collaboratively',
  'Takes initiative',
  'Persists through challenges',
  'Organises materials well',
  'Communicates ideas clearly',
  'Helps peers',
];

const nextStepOptions = [
  'Practice goal setting',
  'Ask clarifying questions more often',
  'Share thinking with the class',
  'Seek feedback and act on it',
  'Build study routines at home',
  'Focus on completing tasks on time',
];

const summaryTemplates = {
  outstanding: 'shows exceptional understanding of concepts',
  meeting: 'is meeting the expected outcomes',
  developing: 'is developing core skills with growing confidence',
  support: 'would benefit from targeted support to master key skills',
};

const effortTemplates = {
  consistent: 'always applies themselves fully',
  generally: 'usually applies steady effort',
  variable: 'can be inconsistent with effort',
  needs: 'needs encouragement to sustain effort',
};

const behaviourTemplates = {
  excellent: 'is consistently respectful and considerate',
  positive: 'brings a positive presence to the classroom',
  reminders: 'responds to gentle reminders about expectations',
  support: 'requires support to maintain positive behaviour choices',
};

const engagementTemplates = {
  enthusiastic: 'engages enthusiastically with learning',
  curious: 'demonstrates curiosity and thoughtful reflection',
  quiet: 'is quietly attentive and focused',
  reluctant: 'can be reluctant to participate at times',
};

const ReportCommentGenerator = () => {
  const [studentName, setStudentName] = useState('');
  const [selections, setSelections] = useState({
    academic: 'meeting',
    behaviour: 'excellent',
    effort: 'consistent',
    engagement: 'enthusiastic',
  });
  const [strengths, setStrengths] = useState(['Works collaboratively']);
  const [nextSteps, setNextSteps] = useState(['Practice goal setting']);
  const [tone, setTone] = useState('celebratory');
  const [copied, setCopied] = useState(false);

  const toggleListSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(entry => entry !== item));
    } else {
      setList([...list, item]);
    }
  };

  const applyPreset = (preset) => {
    const presets = {
      celebratory: {
        academic: 'outstanding',
        behaviour: 'excellent',
        effort: 'consistent',
        engagement: 'enthusiastic',
        strengths: ['Takes initiative', 'Communicates ideas clearly'],
        next: ['Seek feedback and act on it'],
      },
      balanced: {
        academic: 'meeting',
        behaviour: 'positive',
        effort: 'generally',
        engagement: 'curious',
        strengths: ['Works collaboratively', 'Persists through challenges'],
        next: ['Share thinking with the class'],
      },
      supportive: {
        academic: 'developing',
        behaviour: 'reminders',
        effort: 'variable',
        engagement: 'reluctant',
        strengths: ['Organises materials well'],
        next: ['Focus on completing tasks on time', 'Ask clarifying questions more often'],
      },
    };

    const chosen = presets[preset];
    if (!chosen) return;

    setSelections({
      academic: chosen.academic,
      behaviour: chosen.behaviour,
      effort: chosen.effort,
      engagement: chosen.engagement,
    });
    setStrengths(chosen.strengths);
    setNextSteps(chosen.next);
    setTone(preset);
  };

  const comment = useMemo(() => {
    const name = studentName || 'This student';

    const intro = `${name} ${summaryTemplates[selections.academic] || ''}.`;
    const behaviourLine = `${name.split(' ')[0] || name} ${behaviourTemplates[selections.behaviour] || ''} and ${effortTemplates[selections.effort] || ''}.`;
    const engagementLine = `${name.split(' ')[0] || name} ${engagementTemplates[selections.engagement] || ''}.`;

    const strengthsLine = strengths.length
      ? `Strengths: ${strengths.join('; ')}.`
      : '';

    const nextStepsLine = nextSteps.length
      ? `Next steps: ${nextSteps.join('; ')}.`
      : 'Next steps: keep up the great work.';

    const closing = tone === 'supportive'
      ? 'We will continue to scaffold learning with clear routines and checkpoints.'
      : tone === 'balanced'
        ? 'Thank you for the continued partnership at home.'
        : 'Excellent progress this term—keep aiming high!';

    return [intro, behaviourLine, engagementLine, strengthsLine, nextStepsLine, closing]
      .filter(Boolean)
      .join(' ');
  }, [studentName, selections, strengths, nextSteps, tone]);

  const copyComment = async () => {
    try {
      await navigator.clipboard.writeText(comment);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Clipboard copy failed', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">📝</span>
            Report Comment Generator
          </h2>
          <p className="opacity-90">Select criteria and instantly craft a polished overall comment.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => applyPreset('celebratory')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 transition ${tone === 'celebratory' ? 'ring-2 ring-white' : ''}`}
          >
            Celebratory
          </button>
          <button
            onClick={() => applyPreset('balanced')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 transition ${tone === 'balanced' ? 'ring-2 ring-white' : ''}`}
          >
            Balanced
          </button>
          <button
            onClick={() => applyPreset('supportive')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 transition ${tone === 'supportive' ? 'ring-2 ring-white' : ''}`}
          >
            Supportive
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Student name (optional)</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Jordan Lee"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">Leave blank for a generic comment.</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100 space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Quick criteria</h3>
          {Object.entries(criteriaOptions).map(([key, options]) => (
            <div key={key} className="space-y-1">
              <p className="text-sm font-semibold text-slate-700 capitalize">{key}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelections({ ...selections, [key]: option.value })}
                    className={`px-3 py-2 rounded-lg text-sm border transition ${
                      selections[key] === option.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100 space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Strengths</h3>
          <div className="flex flex-wrap gap-2">
            {strengthOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleListSelection(item, strengths, setStrengths)}
                className={`px-3 py-2 rounded-lg text-sm border transition ${
                  strengths.includes(item)
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-slate-800">Next steps</h3>
          <div className="flex flex-wrap gap-2">
            {nextStepOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleListSelection(item, nextSteps, setNextSteps)}
                className={`px-3 py-2 rounded-lg text-sm border transition ${
                  nextSteps.includes(item)
                    ? 'bg-amber-500 text-white border-amber-500 shadow'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-2xl">✨</span> Auto-generated comment
            </h3>
            <p className="text-slate-600 mt-1">Updates instantly as you change criteria.</p>
          </div>
          <button
            onClick={copyComment}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 leading-relaxed">
          {comment}
        </div>
      </div>
    </div>
  );
};

export default ReportCommentGenerator;
