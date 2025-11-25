import React, { useMemo, useState } from 'react';

const criteriaOptions = {
  academic: [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ],
  behaviour: [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ],
  effort: [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ],
  engagement: [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ],
};

const pronounSets = {
  neutral: { subjective: 'they', subjectiveCap: 'They', objective: 'them', possessive: 'their', reflexive: 'themselves' },
  she: { subjective: 'she', subjectiveCap: 'She', objective: 'her', possessive: 'her', reflexive: 'herself' },
  he: { subjective: 'he', subjectiveCap: 'He', objective: 'him', possessive: 'his', reflexive: 'himself' },
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

const sentencePools = {
  academic: {
    high: [
      '{SUBJECT} maintained high achievement this semester and often deepened {POSSESSIVE} understanding beyond the core material.',
      '{SUBJECT} grasped the semester concepts quickly and extended {POSSESSIVE} thinking with insightful questions.',
      '{SUBJECT} consistently connected new ideas to prior learning, showing secure mastery of semester content.',
    ],
    medium: [
      '{SUBJECT} met the semester expectations and consolidated {POSSESSIVE} understanding with steady practice.',
      '{SUBJECT} handled the semester topics with growing confidence and clarified ideas when needed.',
      '{SUBJECT} showed reliable understanding of key units and built on feedback to strengthen skills.',
    ],
    low: [
      '{SUBJECT} worked through the semester concepts with support and focused on building foundational skills.',
      '{SUBJECT} revisited core ideas this semester to close gaps and benefit from targeted guidance.',
      '{SUBJECT} needed additional scaffolds to retain key learning from the semester units.',
    ],
  },
  behaviour: {
    high: [
      '{SUBJECT} modelled respectful conduct all semester and contributed to a calm classroom climate.',
      '{SUBJECT} upheld class expectations throughout the semester and encouraged positive choices in peers.',
      '{SUBJECT} demonstrated consistent courtesy and made the room feel welcoming.',
    ],
    medium: [
      '{SUBJECT} responded well to reminders and maintained respectful behaviour for most of the semester.',
      '{SUBJECT} generally followed routines this semester and reset quickly after prompts.',
      '{SUBJECT} kept behaviour steady overall with occasional check-ins.',
    ],
    low: [
      '{SUBJECT} needed regular coaching on expectations this semester but improved after clear cues.',
      '{SUBJECT} required support to make positive behaviour choices and benefited from consistent boundaries.',
      '{SUBJECT} relied on structured reminders to stay aligned with class routines.',
    ],
  },
  effort: {
    high: [
      '{SUBJECT} poured sustained effort into learning tasks and refined work after feedback.',
      '{SUBJECT} maintained a determined approach all semester and completed tasks with care.',
      '{SUBJECT} routinely double-checked work and persevered through challenges.',
    ],
    medium: [
      '{SUBJECT} showed steady effort this semester and completed most tasks as expected.',
      '{SUBJECT} applied {POSSESSIVE} energy to class activities and followed through with reminders.',
      '{SUBJECT} balanced effort with guidance and met deadlines with light prompting.',
    ],
    low: [
      '{SUBJECT} needed encouragement to sustain effort this semester and responded to check-ins.',
      '{SUBJECT} benefitted from breaking tasks into steps to keep momentum.',
      '{SUBJECT} increased output when given structured goals and close support.',
    ],
  },
  engagement: {
    high: [
      '{SUBJECT} engaged enthusiastically in lessons and shared ideas during the semester.',
      '{SUBJECT} leaned into discussions this semester and sparked rich conversations.',
      '{SUBJECT} embraced collaborative tasks and kept curiosity high.',
    ],
    medium: [
      '{SUBJECT} participated reliably this semester and asked clarifying questions when unsure.',
      '{SUBJECT} stayed attentive in class and contributed when prompted.',
      '{SUBJECT} showed interest in topics and engaged with support during group work.',
    ],
    low: [
      '{SUBJECT} engaged quietly this semester and benefited from targeted invitations to contribute.',
      '{SUBJECT} needed encouragement to join discussions and warmed up with smaller group prompts.',
      '{SUBJECT} responded to structured participation routines to stay involved.',
    ],
  },
};

const ReportCommentGenerator = () => {
  const [studentName, setStudentName] = useState('');
  const [selections, setSelections] = useState({
    academic: 'medium',
    behaviour: 'medium',
    effort: 'medium',
    engagement: 'medium',
  });
  const [strengths, setStrengths] = useState(['Works collaboratively']);
  const [nextSteps, setNextSteps] = useState(['Practice goal setting']);
  const [tone, setTone] = useState('celebratory');
  const [copied, setCopied] = useState(false);
  const [pronounKey, setPronounKey] = useState('neutral');
  const [shuffleCount, setShuffleCount] = useState(0);

  const selectedPronouns = pronounSets[pronounKey] || pronounSets.neutral;

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
        academic: 'high',
        behaviour: 'high',
        effort: 'high',
        engagement: 'high',
        strengths: ['Takes initiative', 'Communicates ideas clearly'],
        next: ['Seek feedback and act on it'],
      },
      balanced: {
        academic: 'medium',
        behaviour: 'medium',
        effort: 'medium',
        engagement: 'medium',
        strengths: ['Works collaboratively', 'Persists through challenges'],
        next: ['Share thinking with the class'],
      },
      supportive: {
        academic: 'low',
        behaviour: 'low',
        effort: 'low',
        engagement: 'low',
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
    setShuffleCount((count) => count + 1);
  };

  const comment = useMemo(() => {
    const displayName = studentName.trim() || 'This student';

    const hashString = (value) => {
      let hash = 0;
      for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
      }
      return hash;
    };

    const selectLine = (pool, salt) => {
      if (!pool?.length) return '';
      const index = Math.abs(hashString(`${salt}-${shuffleCount}`)) % pool.length;
      return pool[index];
    };

    const fillTemplate = (template, subject) => template
      .replaceAll('{SUBJECT}', subject)
      .replaceAll('{POSSESSIVE}', selectedPronouns.possessive)
      .replaceAll('{OBJECT}', selectedPronouns.objective)
      .replaceAll('{REFLEXIVE}', selectedPronouns.reflexive);

    const subjectForIndex = (index) => (index % 2 === 0 ? displayName : selectedPronouns.subjectiveCap);

    const academicLine = fillTemplate(
      selectLine(sentencePools.academic[selections.academic], 'academic'),
      subjectForIndex(0),
    );

    const behaviourLine = fillTemplate(
      selectLine(sentencePools.behaviour[selections.behaviour], 'behaviour'),
      subjectForIndex(1),
    );

    const effortLine = fillTemplate(
      selectLine(sentencePools.effort[selections.effort], 'effort'),
      subjectForIndex(2),
    );

    const engagementLine = fillTemplate(
      selectLine(sentencePools.engagement[selections.engagement], 'engagement'),
      subjectForIndex(3),
    );

    const strengthsLine = strengths.length
      ? `${subjectForIndex(4)} showcased strengths such as ${strengths.join(', ')} this semester.`
      : '';

    const nextStepsLine = nextSteps.length
      ? `${subjectForIndex(5)} identified next steps such as ${nextSteps.join(', ')} to guide future growth.`
      : `${subjectForIndex(5)} finished the semester ready to carry this momentum forward.`;

    const closing = tone === 'supportive'
      ? `${subjectForIndex(6)} responded best when routines were predictable, and that structure will continue.`
      : tone === 'balanced'
        ? `${subjectForIndex(6)} finished the semester ready to build on this solid foundation.`
        : `${subjectForIndex(6)} ended the semester on a high note and is well positioned for next steps.`;

    return [academicLine, behaviourLine, effortLine, engagementLine, strengthsLine, nextStepsLine, closing]
      .filter(Boolean)
      .join(' ');
  }, [studentName, selections, strengths, nextSteps, tone, shuffleCount, selectedPronouns]);

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

          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Pronouns</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'neutral', label: 'They/Them' },
                { value: 'she', label: 'She/Her' },
                { value: 'he', label: 'He/Him' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPronounKey(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm border transition ${
                    pronounKey === option.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShuffleCount((count) => count + 1)}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold shadow hover:bg-slate-300 transition"
            >
              Reshuffle sentences
            </button>
            <button
              onClick={copyComment}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 leading-relaxed">
          {comment}
        </div>
      </div>
    </div>
  );
};

export default ReportCommentGenerator;
