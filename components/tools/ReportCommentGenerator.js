import React, { useMemo, useState } from 'react';

const criteriaOptions = {
  academic: [
    { value: 'veryHigh', label: 'Very high' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'veryLow', label: 'Very low' },
  ],
  behaviour: [
    { value: 'veryHigh', label: 'Very high' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'veryLow', label: 'Very low' },
  ],
  effort: [
    { value: 'veryHigh', label: 'Very high' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'veryLow', label: 'Very low' },
  ],
  engagement: [
    { value: 'veryHigh', label: 'Very high' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'veryLow', label: 'Very low' },
  ],
};

const pronounSets = {
  neutral: { subjective: 'they', subjectiveCap: 'They', objective: 'them', possessive: 'their', reflexive: 'themselves' },
  she: { subjective: 'she', subjectiveCap: 'She', objective: 'her', possessive: 'her', reflexive: 'herself' },
  he: { subjective: 'he', subjectiveCap: 'He', objective: 'him', possessive: 'his', reflexive: 'himself' },
};

const strengthOptions = [
  'working collaboratively with peers',
  'leading group tasks responsibly',
  'taking initiative without prompting',
  'persisting through challenges',
  'organising materials and deadlines well',
  'communicating ideas clearly',
  'supporting classmates kindly',
  'checking work with care',
  'reflecting on feedback thoughtfully',
  'maintaining steady focus in class',
  'contributing creative ideas',
  'using resources independently',
  'managing time efficiently',
  'showing empathy toward others',
  'building a positive class culture',
  'self-monitoring progress',
];

const nextStepOptions = [
  'practising goal setting each week',
  'asking clarifying questions more often',
  'sharing thinking with the class regularly',
  'seeking feedback and acting on it',
  'building study routines at home',
  'focusing on completing tasks on time',
  'organising materials before lessons',
  'using planners to track deadlines',
  'breaking tasks into smaller steps',
  'participating actively in discussions',
  'revisiting notes after each lesson',
  'proofreading work carefully',
  'balancing independent work with collaboration',
  'setting checkpoints for long tasks',
  'arriving prepared with required materials',
  'practising respectful turn taking',
];

const sentencePools = {
  academic: {
    veryHigh: [
      '{SUBJECT} excelled across all semester assessments and regularly enriched class dialogue with advanced insights.',
      '{SUBJECT} demonstrated exceptional scholarship this semester, linking concepts across subjects with ease.',
      '{SUBJECT} consistently delivered exemplary work that exceeded the semester criteria and inspired peers.',
      '{SUBJECT} synthesised complex ideas effortlessly and elevated classroom thinking throughout the term.',
    ],
    high: [
      '{SUBJECT} maintained high achievement this semester and often deepened {POSSESSIVE} understanding beyond the core material.',
      '{SUBJECT} grasped the semester concepts quickly and extended {POSSESSIVE} thinking with insightful questions.',
      '{SUBJECT} consistently connected new ideas to prior learning, showing secure mastery of semester content.',
      '{SUBJECT} produced confident responses to challenging tasks and applied feedback with precision.',
    ],
    medium: [
      '{SUBJECT} met the semester expectations and consolidated {POSSESSIVE} understanding with steady practice.',
      '{SUBJECT} handled the semester topics with growing confidence and clarified ideas when needed.',
      '{SUBJECT} showed reliable understanding of key units and built on feedback to strengthen skills.',
      '{SUBJECT} progressed steadily through the semester curriculum and checked comprehension regularly.',
    ],
    low: [
      '{SUBJECT} worked through the semester concepts with support and focused on building foundational skills.',
      '{SUBJECT} revisited core ideas this semester to close gaps and benefit from targeted guidance.',
      '{SUBJECT} needed additional scaffolds to retain key learning from the semester units.',
      '{SUBJECT} responded best when lessons were chunked and practice was closely supported.',
    ],
    veryLow: [
      '{SUBJECT} required significant scaffolding this semester and steadily rebuilt confidence with targeted reteach sessions.',
      '{SUBJECT} revisited essential skills frequently and showed progress when pacing was carefully structured.',
      '{SUBJECT} benefited from one-to-one prompts to connect lessons and retain core knowledge.',
      '{SUBJECT} relied on guided practice to access the semester content and is prepared for continued reinforcement.',
    ],
  },
  behaviour: {
    veryHigh: [
      '{SUBJECT} modelled exemplary conduct all semester and proactively supported classmates in following routines.',
      '{SUBJECT} set a calm tone for the room and consistently upheld our shared expectations.',
      '{SUBJECT} demonstrated leadership by reinforcing respectful choices throughout the semester.',
      '{SUBJECT} anticipated classroom needs and quietly ensured the environment stayed positive.',
    ],
    high: [
      '{SUBJECT} modelled respectful conduct all semester and contributed to a calm classroom climate.',
      '{SUBJECT} upheld class expectations throughout the semester and encouraged positive choices in peers.',
      '{SUBJECT} demonstrated consistent courtesy and made the room feel welcoming.',
      '{SUBJECT} responded thoughtfully to community norms and supported others in doing the same.',
    ],
    medium: [
      '{SUBJECT} responded well to reminders and maintained respectful behaviour for most of the semester.',
      '{SUBJECT} generally followed routines this semester and reset quickly after prompts.',
      '{SUBJECT} kept behaviour steady overall with occasional check-ins.',
      '{SUBJECT} maintained a positive presence with light guidance to stay on track.',
    ],
    low: [
      '{SUBJECT} needed regular coaching on expectations this semester but improved after clear cues.',
      '{SUBJECT} required support to make positive behaviour choices and benefited from consistent boundaries.',
      '{SUBJECT} relied on structured reminders to stay aligned with class routines.',
      '{SUBJECT} responded to restorative chats and made gradual progress with consistent follow-up.',
    ],
    veryLow: [
      '{SUBJECT} needed frequent intervention to meet expectations this semester and improved with predictable routines.',
      '{SUBJECT} benefited from immediate, calm redirection and role-played choices to build habits.',
      '{SUBJECT} required close partnership with home and school to sustain positive behaviour changes.',
      '{SUBJECT} practiced repairing harm when missteps occurred and will keep building those habits.',
    ],
  },
  effort: {
    veryHigh: [
      '{SUBJECT} poured exceptional effort into every task this semester and iterated until work met ambitious goals.',
      '{SUBJECT} sustained focus during complex projects and demonstrated impressive self-discipline.',
      '{SUBJECT} persistently refined drafts, showing remarkable ownership of learning.',
      '{SUBJECT} sought stretch challenges and turned feedback into immediate improvement.',
    ],
    high: [
      '{SUBJECT} poured sustained effort into learning tasks and refined work after feedback.',
      '{SUBJECT} maintained a determined approach all semester and completed tasks with care.',
      '{SUBJECT} routinely double-checked work and persevered through challenges.',
      '{SUBJECT} balanced ambition with careful execution, resulting in polished work.',
    ],
    medium: [
      '{SUBJECT} showed steady effort this semester and completed most tasks as expected.',
      '{SUBJECT} applied {POSSESSIVE} energy to class activities and followed through with reminders.',
      '{SUBJECT} balanced effort with guidance and met deadlines with light prompting.',
      '{SUBJECT} kept momentum by checking progress mid-task and adjusting when needed.',
    ],
    low: [
      '{SUBJECT} needed encouragement to sustain effort this semester and responded to check-ins.',
      '{SUBJECT} benefitted from breaking tasks into steps to keep momentum.',
      '{SUBJECT} increased output when given structured goals and close support.',
      '{SUBJECT} was more productive with short, timed bursts and visible success criteria.',
    ],
    veryLow: [
      '{SUBJECT} required close coaching to initiate and persist with tasks this semester.',
      '{SUBJECT} benefited from frequent goal resets and celebrated small wins to stay engaged.',
      '{SUBJECT} needed consistent adult partnership to move learning forward each session.',
      '{SUBJECT} relied on visual checklists to begin work and maintain effort.',
    ],
  },
  engagement: {
    veryHigh: [
      '{SUBJECT} engaged enthusiastically in every lesson and frequently sparked rich peer discussion.',
      '{SUBJECT} embraced new topics with curiosity and invited others into learning all semester.',
      '{SUBJECT} consistently took intellectual risks and energised class conversations.',
      '{SUBJECT} elevated group work with thoughtful questions that deepened inquiry.',
    ],
    high: [
      '{SUBJECT} engaged enthusiastically in lessons and shared ideas during the semester.',
      '{SUBJECT} leaned into discussions this semester and sparked rich conversations.',
      '{SUBJECT} embraced collaborative tasks and kept curiosity high.',
      '{SUBJECT} connected learning to real-world examples and kept peers interested.',
    ],
    medium: [
      '{SUBJECT} participated reliably this semester and asked clarifying questions when unsure.',
      '{SUBJECT} stayed attentive in class and contributed when prompted.',
      '{SUBJECT} showed interest in topics and engaged with support during group work.',
      '{SUBJECT} followed lesson routines and shared ideas after brief think time.',
    ],
    low: [
      '{SUBJECT} engaged quietly this semester and benefited from targeted invitations to contribute.',
      '{SUBJECT} needed encouragement to join discussions and warmed up with smaller group prompts.',
      '{SUBJECT} responded to structured participation routines to stay involved.',
      '{SUBJECT} was most responsive when roles were clearly defined during collaboration.',
    ],
    veryLow: [
      '{SUBJECT} needed frequent prompts to participate this semester and responded best to clear roles.',
      '{SUBJECT} benefited from previewing questions and practising responses before sharing.',
      '{SUBJECT} required close facilitation to remain engaged and gradually increased contributions.',
      '{SUBJECT} stayed involved when tasks were brief, concrete, and scaffolded with visuals.',
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
  const [strengths, setStrengths] = useState(['working collaboratively with peers']);
  const [nextSteps, setNextSteps] = useState(['practising goal setting each week']);
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

  const normaliseList = (list) => Array.from(new Set(list))
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.charAt(0).toLowerCase() + entry.slice(1));

  const applyPreset = (preset) => {
    const presets = {
      celebratory: {
        academic: 'veryHigh',
        behaviour: 'veryHigh',
        effort: 'veryHigh',
        engagement: 'veryHigh',
        strengths: ['taking initiative without prompting', 'communicating ideas clearly'],
        next: ['seeking feedback and acting on it'],
      },
      balanced: {
        academic: 'medium',
        behaviour: 'medium',
        effort: 'medium',
        engagement: 'medium',
        strengths: ['working collaboratively with peers', 'persisting through challenges'],
        next: ['sharing thinking with the class regularly'],
      },
      supportive: {
        academic: 'veryLow',
        behaviour: 'veryLow',
        effort: 'veryLow',
        engagement: 'veryLow',
        strengths: ['organising materials and deadlines well'],
        next: ['focusing on completing tasks on time', 'asking clarifying questions more often'],
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

    const poolForSelection = (category) => {
      const options = sentencePools[category];
      return options[selections[category]] || options.medium;
    };

    const fillTemplate = (template, subject) => template
      .replaceAll('{SUBJECT}', subject)
      .replaceAll('{POSSESSIVE}', selectedPronouns.possessive)
      .replaceAll('{OBJECT}', selectedPronouns.objective)
      .replaceAll('{REFLEXIVE}', selectedPronouns.reflexive);

    const subjectForIndex = (index) => (index % 2 === 0 ? displayName : selectedPronouns.subjectiveCap);

    const academicLine = fillTemplate(selectLine(poolForSelection('academic'), 'academic'), subjectForIndex(0));

    const behaviourLine = fillTemplate(selectLine(poolForSelection('behaviour'), 'behaviour'), subjectForIndex(1));

    const effortLine = fillTemplate(selectLine(poolForSelection('effort'), 'effort'), subjectForIndex(2));

    const engagementLine = fillTemplate(selectLine(poolForSelection('engagement'), 'engagement'), subjectForIndex(3));

    const formattedStrengths = normaliseList(strengths);
    const formattedNextSteps = normaliseList(nextSteps);

    const strengthsLine = formattedStrengths.length
      ? `${subjectForIndex(4)} showcased strengths such as ${formattedStrengths.join(', ')} this semester.`
      : '';

    const nextStepsLine = formattedNextSteps.length
      ? `${subjectForIndex(5)} identified next steps such as ${formattedNextSteps.join(', ')} to guide future growth.`
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
