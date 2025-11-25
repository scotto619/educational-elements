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

const qualitiesOptions = [
  'enthusiastic',
  'capable',
  'caring',
  'thoughtful',
  'resilient',
  'curious',
  'collaborative',
  'adaptable',
  'creative',
  'reflective',
  'dependable',
  'resourceful',
  'confident',
  'determined',
  'supportive',
  'respectful',
  'empathetic',
  'motivated',
  'patient',
  'responsible',
  'organised',
  'open-minded',
  'inquisitive',
  'self-directed',
];

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
  'embracing stretch goals willingly',
  'initiating peer tutoring sessions',
  'curating high-quality research sources',
  'adapting quickly to new routines',
  'leading reflective debriefs after tasks',
  'demonstrating integrity during assessments',
  'encouraging quieter voices to share',
  'seeking out enrichment opportunities',
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
  'creating weekly revision flashcards',
  'tracking progress with exit tickets',
  'rehearsing presentations aloud before sharing',
  'building stamina with timed practice',
  'annotating readings to capture key ideas',
  'using graphic organisers to plan responses',
  'drafting questions ahead of lessons',
  'seeking enrichment tasks to extend learning',
];

const closingPools = {
  celebratory: [
    '{SUBJECT} ended the semester on a high note and is well positioned for next steps.',
    '{SUBJECT} concluded the term with momentum and is primed to stretch further.',
    '{SUBJECT} wrapped up the semester proudly and is eager for new challenges ahead.',
    '{SUBJECT} closed the term strongly and is set to build on these successes.',
  ],
  balanced: [
    '{SUBJECT} finished the semester ready to build on this solid foundation.',
    '{SUBJECT} concluded the term with steady growth and a clear path forward.',
    '{SUBJECT} wrapped up the semester confidently and is prepared to extend these gains.',
    '{SUBJECT} ended the term with consistent progress that will support next steps.',
  ],
  supportive: [
    '{SUBJECT} responded best when routines were predictable, and that structure will continue.',
    '{SUBJECT} closed the semester with renewed confidence and will benefit from ongoing scaffolds.',
    '{SUBJECT} finished the term knowing which supports help most and is ready to use them again.',
    '{SUBJECT} ended the semester steadily and will keep leaning on clear routines to grow.',
  ],
};

const sentencePools = {
  academic: {
    veryHigh: [
      '{SUBJECT} excelled across all semester assessments and regularly enriched class dialogue with advanced insights.',
      '{SUBJECT} demonstrated exceptional scholarship this semester, linking concepts across subjects with ease.',
      '{SUBJECT} consistently delivered exemplary work that exceeded the semester criteria and inspired peers.',
      '{SUBJECT} synthesised complex ideas effortlessly and elevated classroom thinking throughout the term.',
      '{SUBJECT} pursued extension tasks eagerly and transformed feedback into nuanced, high-level responses.',
      '{SUBJECT} connected theory to authentic examples and helped peers grasp abstract concepts.',
      '{SUBJECT} collaborated as a thought partner for classmates and modelled academic curiosity all semester.',
      '{SUBJECT} excelled in project work, integrating research, reflection, and precision to a remarkable standard.',
    ],
    high: [
      '{SUBJECT} maintained high achievement this semester and often deepened {POSSESSIVE} understanding beyond the core material.',
      '{SUBJECT} grasped the semester concepts quickly and extended {POSSESSIVE} thinking with insightful questions.',
      '{SUBJECT} consistently connected new ideas to prior learning, showing secure mastery of semester content.',
      '{SUBJECT} produced confident responses to challenging tasks and applied feedback with precision.',
      '{SUBJECT} demonstrated thoughtful reasoning during discussions and strengthened ideas with evidence.',
      '{SUBJECT} analysed mistakes constructively and adjusted strategies to keep standards high.',
      '{SUBJECT} navigated multi-step tasks with confidence and articulated clear conclusions.',
      '{SUBJECT} routinely verified solutions and showed strong command of core skills.',
    ],
    medium: [
      '{SUBJECT} met the semester expectations and consolidated {POSSESSIVE} understanding with steady practice.',
      '{SUBJECT} handled the semester topics with growing confidence and clarified ideas when needed.',
      '{SUBJECT} showed reliable understanding of key units and built on feedback to strengthen skills.',
      '{SUBJECT} progressed steadily through the semester curriculum and checked comprehension regularly.',
      '{SUBJECT} asked timely questions to remove confusion and kept assignments on track.',
      '{SUBJECT} used class notes effectively and rehearsed new techniques until they felt secure.',
      '{SUBJECT} completed practice tasks methodically and reflected on next moves with guidance.',
      '{SUBJECT} kept pace with lesson goals by reviewing examples and applying them independently.',
    ],
    low: [
      '{SUBJECT} worked through the semester concepts with support and focused on building foundational skills.',
      '{SUBJECT} revisited core ideas this semester to close gaps and benefit from targeted guidance.',
      '{SUBJECT} needed additional scaffolds to retain key learning from the semester units.',
      '{SUBJECT} responded best when lessons were chunked and practice was closely supported.',
      '{SUBJECT} benefited from repeated modelling and gradually strengthened recall of key steps.',
      '{SUBJECT} used checkpoints to steady progress and relied on visuals to clarify complex tasks.',
      '{SUBJECT} rehearsed core routines frequently and showed growth when practice was structured.',
      '{SUBJECT} built confidence through short, guided attempts before trying tasks independently.',
    ],
    veryLow: [
      '{SUBJECT} required significant scaffolding this semester and steadily rebuilt confidence with targeted reteach sessions.',
      '{SUBJECT} revisited essential skills frequently and showed progress when pacing was carefully structured.',
      '{SUBJECT} benefited from one-to-one prompts to connect lessons and retain core knowledge.',
      '{SUBJECT} relied on guided practice to access the semester content and is prepared for continued reinforcement.',
      '{SUBJECT} worked closely with support staff to re-establish fundamentals and celebrated each small gain.',
      '{SUBJECT} responded to multisensory approaches and short review cycles to stabilise learning.',
      '{SUBJECT} rebuilt understanding one concept at a time and appreciated consistent check-ins.',
      '{SUBJECT} leaned on scaffolded examples to make sense of new ideas and will keep revisiting them.',
    ],
  },
  behaviour: {
    veryHigh: [
      '{SUBJECT} modelled exemplary conduct all semester and proactively supported classmates in following routines.',
      '{SUBJECT} set a calm tone for the room and consistently upheld our shared expectations.',
      '{SUBJECT} demonstrated leadership by reinforcing respectful choices throughout the semester.',
      '{SUBJECT} anticipated classroom needs and quietly ensured the environment stayed positive.',
      '{SUBJECT} proactively resolved minor conflicts and maintained a caring atmosphere.',
      '{SUBJECT} noticed when others needed space or support and responded with empathy.',
      '{SUBJECT} balanced assertiveness with kindness and helped peers stay focused.',
      '{SUBJECT} protected learning time by redirecting off-task moments with tact.',
    ],
    high: [
      '{SUBJECT} modelled respectful conduct all semester and contributed to a calm classroom climate.',
      '{SUBJECT} upheld class expectations throughout the semester and encouraged positive choices in peers.',
      '{SUBJECT} demonstrated consistent courtesy and made the room feel welcoming.',
      '{SUBJECT} responded thoughtfully to community norms and supported others in doing the same.',
      '{SUBJECT} maintained a friendly tone and prompted peers to reset quietly when needed.',
      '{SUBJECT} took ownership of shared spaces and kept routines smooth for everyone.',
      '{SUBJECT} chose considerate responses during disagreements and restored calm quickly.',
      '{SUBJECT} reinforced transitions gently, helping lessons begin without delay.',
    ],
    medium: [
      '{SUBJECT} responded well to reminders and maintained respectful behaviour for most of the semester.',
      '{SUBJECT} generally followed routines this semester and reset quickly after prompts.',
      '{SUBJECT} kept behaviour steady overall with occasional check-ins.',
      '{SUBJECT} maintained a positive presence with light guidance to stay on track.',
      '{SUBJECT} matched the class tone after brief cues and showed steady cooperation.',
      '{SUBJECT} took feedback on board and made calm adjustments to remain engaged.',
      '{SUBJECT} responded positively to proximity support and stayed focused during key moments.',
      '{SUBJECT} respected boundaries after reminders and contributed to a settled room.',
    ],
    low: [
      '{SUBJECT} needed regular coaching on expectations this semester but improved after clear cues.',
      '{SUBJECT} required support to make positive behaviour choices and benefited from consistent boundaries.',
      '{SUBJECT} relied on structured reminders to stay aligned with class routines.',
      '{SUBJECT} responded to restorative chats and made gradual progress with consistent follow-up.',
      '{SUBJECT} worked on pausing before reacting and practiced calmer responses with guidance.',
      '{SUBJECT} benefited from visual reminders and pre-agreed signals to reset behaviour.',
      '{SUBJECT} made gains when expectations were rehearsed and reinforced before each lesson.',
      '{SUBJECT} responded to short reflections that clarified impact on the class community.',
    ],
    veryLow: [
      '{SUBJECT} needed frequent intervention to meet expectations this semester and improved with predictable routines.',
      '{SUBJECT} benefited from immediate, calm redirection and role-played choices to build habits.',
      '{SUBJECT} required close partnership with home and school to sustain positive behaviour changes.',
      '{SUBJECT} practiced repairing harm when missteps occurred and will keep building those habits.',
      '{SUBJECT} received layered supports to regulate emotions and found success with consistent check-ins.',
      '{SUBJECT} rehearsed expected behaviours in advance and gradually increased independence.',
      '{SUBJECT} relied on restorative follow-ups to rebuild trust and reconnect with learning.',
      '{SUBJECT} co-created clear plans with adults and referred back to them to stay centred.',
    ],
  },
  effort: {
    veryHigh: [
      '{SUBJECT} poured exceptional effort into every task this semester and iterated until work met ambitious goals.',
      '{SUBJECT} sustained focus during complex projects and demonstrated impressive self-discipline.',
      '{SUBJECT} persistently refined drafts, showing remarkable ownership of learning.',
      '{SUBJECT} sought stretch challenges and turned feedback into immediate improvement.',
      '{SUBJECT} embraced rigorous success criteria and pushed output to an advanced level.',
      '{SUBJECT} managed multiple deadlines smoothly and showcased disciplined study habits.',
      '{SUBJECT} stayed deeply committed to quality, adjusting work until it reflected {POSSESSIVE} best thinking.',
      '{SUBJECT} fuelled group projects with energy and careful planning, resulting in standout outcomes.',
    ],
    high: [
      '{SUBJECT} poured sustained effort into learning tasks and refined work after feedback.',
      '{SUBJECT} maintained a determined approach all semester and completed tasks with care.',
      '{SUBJECT} routinely double-checked work and persevered through challenges.',
      '{SUBJECT} balanced ambition with careful execution, resulting in polished work.',
      '{SUBJECT} organised study time effectively and arrived ready to work each lesson.',
      '{SUBJECT} used peer and teacher feedback promptly to lift the quality of submissions.',
      '{SUBJECT} committed to finishing tasks to a high standard and kept focus during practice.',
      '{SUBJECT} sustained curiosity during tricky tasks and stayed composed when solving problems.',
    ],
    medium: [
      '{SUBJECT} showed steady effort this semester and completed most tasks as expected.',
      '{SUBJECT} applied {POSSESSIVE} energy to class activities and followed through with reminders.',
      '{SUBJECT} balanced effort with guidance and met deadlines with light prompting.',
      '{SUBJECT} kept momentum by checking progress mid-task and adjusting when needed.',
      '{SUBJECT} paced {POSSESSIVE} work sensibly and revisited feedback to refine attempts.',
      '{SUBJECT} stayed on task with occasional nudges and took pride in finished pieces.',
      '{SUBJECT} persisted through routine practice and asked for examples when stuck.',
      '{SUBJECT} tracked progress against goals and sought clarification to keep moving.',
    ],
    low: [
      '{SUBJECT} needed encouragement to sustain effort this semester and responded to check-ins.',
      '{SUBJECT} benefitted from breaking tasks into steps to keep momentum.',
      '{SUBJECT} increased output when given structured goals and close support.',
      '{SUBJECT} was more productive with short, timed bursts and visible success criteria.',
      '{SUBJECT} made progress when tasks were scaffolded and expectations were rehearsed aloud.',
      '{SUBJECT} leaned on visual timers and mini-deadlines to sustain attention.',
      '{SUBJECT} benefited from pairing with focused peers and celebrating incremental wins.',
      '{SUBJECT} needed reassurance to re-engage after setbacks and resumed work with guidance.',
    ],
    veryLow: [
      '{SUBJECT} required close coaching to initiate and persist with tasks this semester.',
      '{SUBJECT} benefited from frequent goal resets and celebrated small wins to stay engaged.',
      '{SUBJECT} needed consistent adult partnership to move learning forward each session.',
      '{SUBJECT} relied on visual checklists to begin work and maintain effort.',
      '{SUBJECT} used step-by-step conferencing to get started and maintained focus briefly before breaks.',
      '{SUBJECT} responded to co-created plans that broke tasks down and clarified first steps.',
      '{SUBJECT} required steady encouragement to persevere past the opening stages of tasks.',
      '{SUBJECT} relied on repeated modelling to remain engaged and mirrored prompts to continue.',
    ],
  },
  engagement: {
    veryHigh: [
      '{SUBJECT} engaged enthusiastically in every lesson and frequently sparked rich peer discussion.',
      '{SUBJECT} embraced new topics with curiosity and invited others into learning all semester.',
      '{SUBJECT} consistently took intellectual risks and energised class conversations.',
      '{SUBJECT} elevated group work with thoughtful questions that deepened inquiry.',
      '{SUBJECT} pursued extra readings and shared insights that broadened our collective understanding.',
      '{SUBJECT} embraced leadership roles in projects and ensured everyone’s ideas were heard.',
      '{SUBJECT} maintained a reflective journal that enriched class debates with new perspectives.',
      '{SUBJECT} eagerly connected lesson themes to current events, keeping discussions vibrant.',
    ],
    high: [
      '{SUBJECT} engaged enthusiastically in lessons and shared ideas during the semester.',
      '{SUBJECT} leaned into discussions this semester and sparked rich conversations.',
      '{SUBJECT} embraced collaborative tasks and kept curiosity high.',
      '{SUBJECT} connected learning to real-world examples and kept peers interested.',
      '{SUBJECT} contributed thoughtful follow-up questions that moved the dialogue forward.',
      '{SUBJECT} encouraged quieter classmates to share and celebrated their contributions.',
      '{SUBJECT} participated actively in experiments and explained findings with clarity.',
      '{SUBJECT} applied class concepts to personal interests, adding freshness to conversations.',
    ],
    medium: [
      '{SUBJECT} participated reliably this semester and asked clarifying questions when unsure.',
      '{SUBJECT} stayed attentive in class and contributed when prompted.',
      '{SUBJECT} showed interest in topics and engaged with support during group work.',
      '{SUBJECT} followed lesson routines and shared ideas after brief think time.',
      '{SUBJECT} noted key points in discussions and responded thoughtfully when invited.',
      '{SUBJECT} contributed small but meaningful insights during partner tasks.',
      '{SUBJECT} engaged most readily when activities were hands-on and structured.',
      '{SUBJECT} participated steadily in review sessions and built confidence answering questions.',
    ],
    low: [
      '{SUBJECT} engaged quietly this semester and benefited from targeted invitations to contribute.',
      '{SUBJECT} needed encouragement to join discussions and warmed up with smaller group prompts.',
      '{SUBJECT} responded to structured participation routines to stay involved.',
      '{SUBJECT} was most responsive when roles were clearly defined during collaboration.',
      '{SUBJECT} engaged once rapport was built and tasks connected to personal interests.',
      '{SUBJECT} benefited from think-pair-share structures and brief rehearsal time.',
      '{SUBJECT} shared more readily after previewing questions ahead of discussions.',
      '{SUBJECT} connected with the learning when visuals or movement were incorporated.',
    ],
    veryLow: [
      '{SUBJECT} needed frequent prompts to participate this semester and responded best to clear roles.',
      '{SUBJECT} benefited from previewing questions and practising responses before sharing.',
      '{SUBJECT} required close facilitation to remain engaged and gradually increased contributions.',
      '{SUBJECT} stayed involved when tasks were brief, concrete, and scaffolded with visuals.',
    ],
  },
};

const openingPools = [
  '{NAME} was {ARTICLE} {QUALITIES} student who embraced learning across the semester.',
  '{NAME} was {ARTICLE} {QUALITIES} student who navigated the semester with care and focus.',
  '{NAME} was {ARTICLE} {QUALITIES} student who consistently contributed to our classroom community.',
  '{NAME} was {ARTICLE} {QUALITIES} student who approached each semester challenge with maturity.',
  '{NAME} was {ARTICLE} {QUALITIES} student who thrived when collaborating and reflecting.',
  '{NAME} was {ARTICLE} {QUALITIES} student who made the most of every semester opportunity.',
];

const ReportCommentGenerator = () => {
  const [studentName, setStudentName] = useState('');
  const [selections, setSelections] = useState({
    academic: 'medium',
    behaviour: 'medium',
    effort: 'medium',
    engagement: 'medium',
  });
  const [qualities, setQualities] = useState(['enthusiastic']);
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

  const formatListForSentence = (list) => {
    if (list.length === 0) return '';
    if (list.length === 1) return list[0];
    if (list.length === 2) return `${list[0]} and ${list[1]}`;
    return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`;
  };

  const chooseArticle = (word) => {
    if (!word) return 'a';
    return ['a', 'e', 'i', 'o', 'u'].includes(word[0].toLowerCase()) ? 'an' : 'a';
  };

  const applyPreset = (preset) => {
    const presets = {
      celebratory: {
        academic: 'veryHigh',
        behaviour: 'veryHigh',
        effort: 'veryHigh',
        engagement: 'veryHigh',
        qualities: ['enthusiastic', 'capable'],
        strengths: ['taking initiative without prompting', 'communicating ideas clearly'],
        next: ['seeking feedback and acting on it'],
      },
      balanced: {
        academic: 'medium',
        behaviour: 'medium',
        effort: 'medium',
        engagement: 'medium',
        qualities: ['reflective', 'dependable'],
        strengths: ['working collaboratively with peers', 'persisting through challenges'],
        next: ['sharing thinking with the class regularly'],
      },
      supportive: {
        academic: 'veryLow',
        behaviour: 'veryLow',
        effort: 'veryLow',
        engagement: 'veryLow',
        qualities: ['caring', 'patient'],
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
    setQualities(chosen.qualities || ['enthusiastic']);
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

    const formattedQualities = normaliseList(qualities);
    const qualitiesList = formatListForSentence(formattedQualities);
    const chosenArticle = chooseArticle(formattedQualities[0]);
    const openingTemplate = selectLine(openingPools, 'opening');
    const openingLine = openingTemplate
      .replace('{NAME}', displayName)
      .replace('{ARTICLE}', chosenArticle)
      .replace('{QUALITIES}', qualitiesList || 'dedicated');

    const academicLine = fillTemplate(selectLine(poolForSelection('academic'), 'academic'), subjectForIndex(1));

    const behaviourLine = fillTemplate(selectLine(poolForSelection('behaviour'), 'behaviour'), subjectForIndex(2));

    const effortLine = fillTemplate(selectLine(poolForSelection('effort'), 'effort'), subjectForIndex(3));

    const engagementLine = fillTemplate(selectLine(poolForSelection('engagement'), 'engagement'), subjectForIndex(4));

    const formattedStrengths = normaliseList(strengths);
    const formattedNextSteps = normaliseList(nextSteps);

    const strengthsLine = formattedStrengths.length
      ? `${subjectForIndex(5)} showcased strengths such as ${formatListForSentence(formattedStrengths)} this semester.`
      : '';

    const nextStepsLine = formattedNextSteps.length
      ? `${subjectForIndex(6)} identified next steps such as ${formatListForSentence(formattedNextSteps)} to guide future growth.`
      : `${subjectForIndex(6)} finished the semester ready to carry this momentum forward.`;

    const tonePool = closingPools[tone] || closingPools.balanced;
    const closingTemplate = selectLine(tonePool, `closing-${tone}`);
    const closing = fillTemplate(closingTemplate, subjectForIndex(7));

    return [openingLine, academicLine, behaviourLine, effortLine, engagementLine, strengthsLine, nextStepsLine, closing]
      .filter(Boolean)
      .join(' ');
  }, [studentName, selections, strengths, nextSteps, tone, shuffleCount, selectedPronouns, qualities]);

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
          <h3 className="text-lg font-semibold text-slate-800">Opening qualities</h3>
          <p className="text-sm text-slate-600">These build the first sentence like "Jordan was an enthusiastic student who..."</p>
          <div className="flex flex-wrap gap-2">
            {qualitiesOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleListSelection(item, qualities, setQualities)}
                className={`px-3 py-2 rounded-lg text-sm border transition ${
                  qualities.includes(item)
                    ? 'bg-purple-600 text-white border-purple-600 shadow'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

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
