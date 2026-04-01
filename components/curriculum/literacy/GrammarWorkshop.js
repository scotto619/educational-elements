// components/curriculum/literacy/GrammarWorkshop.js
// Interactive Grammar Workshop for primary school students (ages 6–12)
import React, { useState, useCallback } from 'react';

// ─── Grammar Topic Data ───────────────────────────────────────────────────────

const TOPICS = [
  {
    id: 'nouns',
    name: 'Nouns',
    icon: '🏛️',
    colour: 'from-blue-500 to-indigo-600',
    lightBg: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    definition: 'A noun is a word that names a person, place, thing, or idea.',
    types: [
      { name: 'Person', examples: ['teacher', 'child', 'doctor', 'friend'] },
      { name: 'Place', examples: ['school', 'beach', 'park', 'city'] },
      { name: 'Thing', examples: ['book', 'apple', 'chair', 'car'] },
      { name: 'Idea', examples: ['happiness', 'freedom', 'courage', 'love'] },
    ],
    tip: 'Tip: Try putting "the" or "a" in front of a word — if it sounds right, it\'s probably a noun! E.g. "the teacher", "a book".',
    questions: [
      {
        q: 'Which word is a noun?',
        sentence: 'The happy dog ran quickly.',
        options: ['happy', 'dog', 'ran', 'quickly'],
        answer: 'dog',
        explanation: '"Dog" names an animal (thing), so it is a noun.',
      },
      {
        q: 'Which word is a noun?',
        sentence: 'She read a beautiful story.',
        options: ['She', 'read', 'beautiful', 'story'],
        answer: 'story',
        explanation: '"Story" names a thing. (Note: "She" is a pronoun, not a noun.)',
      },
      {
        q: 'Which sentence contains a PLACE noun?',
        sentence: null,
        options: [
          'The brave knight fought.',
          'We visited the museum.',
          'She felt great joy.',
          'The dog barked loudly.',
        ],
        answer: 'We visited the museum.',
        explanation: '"Museum" is a place noun.',
      },
      {
        q: 'How many nouns are in this sentence? "The cat sat on the mat."',
        sentence: 'The cat sat on the mat.',
        options: ['1', '2', '3', '4'],
        answer: '2',
        explanation: '"Cat" and "mat" are both nouns — they name things.',
      },
      {
        q: 'Which word is an IDEA (abstract) noun?',
        sentence: null,
        options: ['river', 'teacher', 'freedom', 'pencil'],
        answer: 'freedom',
        explanation: '"Freedom" is an abstract noun — you can\'t touch or see it.',
      },
    ],
  },
  {
    id: 'verbs',
    name: 'Verbs',
    icon: '🏃',
    colour: 'from-orange-500 to-rose-500',
    lightBg: 'from-orange-50 to-rose-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    definition: 'A verb is an action or doing word. It tells us what someone or something does, is, or has.',
    types: [
      { name: 'Action verbs', examples: ['run', 'jump', 'write', 'think'] },
      { name: 'Being verbs', examples: ['is', 'are', 'was', 'were'] },
      { name: 'Having verbs', examples: ['have', 'has', 'had'] },
    ],
    tip: 'Tip: Ask "What is the subject DOING?" — the answer is usually the verb! E.g. "The bird is flying" → flying.',
    questions: [
      {
        q: 'Which word is a verb?',
        sentence: 'The excited puppy jumped over the fence.',
        options: ['excited', 'puppy', 'jumped', 'fence'],
        answer: 'jumped',
        explanation: '"Jumped" is the action the puppy did.',
      },
      {
        q: 'Which word is a BEING verb?',
        sentence: null,
        options: ['run', 'sing', 'were', 'yellow'],
        answer: 'were',
        explanation: '"Were" is a being/linking verb (past tense of "are").',
      },
      {
        q: 'Which sentence uses a verb in the PAST tense?',
        sentence: null,
        options: [
          'She is walking to school.',
          'They will play tomorrow.',
          'He kicked the ball.',
          'I swim every day.',
        ],
        answer: 'He kicked the ball.',
        explanation: '"Kicked" is the past tense of "kick".',
      },
      {
        q: 'How many verbs are in: "She sang and danced."',
        sentence: 'She sang and danced.',
        options: ['1', '2', '3', '0'],
        answer: '2',
        explanation: '"Sang" and "danced" are both verbs.',
      },
      {
        q: 'Which word could replace the verb in "The bird flies high."?',
        sentence: 'The bird flies high.',
        options: ['blue', 'soars', 'happy', 'quickly'],
        answer: 'soars',
        explanation: '"Soars" is also a verb that makes sense here.',
      },
    ],
  },
  {
    id: 'adjectives',
    name: 'Adjectives',
    icon: '🎨',
    colour: 'from-purple-500 to-fuchsia-500',
    lightBg: 'from-purple-50 to-fuchsia-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    definition: 'An adjective is a describing word. It tells us more about a noun — its size, colour, shape, feeling, or number.',
    types: [
      { name: 'Colour/appearance', examples: ['red', 'tall', 'round', 'tiny'] },
      { name: 'Feeling/opinion', examples: ['happy', 'scary', 'delicious', 'boring'] },
      { name: 'Number/quantity', examples: ['three', 'many', 'few', 'some'] },
    ],
    tip: 'Tip: Adjectives usually come BEFORE the noun they describe. Ask "What KIND of [noun]?" to find them.',
    questions: [
      {
        q: 'Which word is an adjective?',
        sentence: 'A fluffy white rabbit hopped past.',
        options: ['rabbit', 'hopped', 'fluffy', 'past'],
        answer: 'fluffy',
        explanation: '"Fluffy" describes what the rabbit is like — it\'s an adjective.',
      },
      {
        q: 'How many adjectives are in: "The tiny, noisy frog croaked."',
        sentence: 'The tiny, noisy frog croaked.',
        options: ['1', '2', '3', '0'],
        answer: '2',
        explanation: '"Tiny" and "noisy" both describe the frog.',
      },
      {
        q: 'Which sentence uses an adjective correctly?',
        sentence: null,
        options: [
          'She ran quickly.',
          'He ate the golden apple.',
          'They swim far.',
          'I think deeply.',
        ],
        answer: 'He ate the golden apple.',
        explanation: '"Golden" is an adjective describing the apple.',
      },
      {
        q: 'Which word is NOT an adjective in this list?',
        sentence: null,
        options: ['enormous', 'sparkly', 'beneath', 'ancient'],
        answer: 'beneath',
        explanation: '"Beneath" is a preposition (position word), not a describing word.',
      },
      {
        q: 'Choose the best adjective to complete: "The ___ dragon breathed fire."',
        sentence: null,
        options: ['fierce', 'slowly', 'laughed', 'under'],
        answer: 'fierce',
        explanation: '"Fierce" is an adjective that describes the dragon.',
      },
    ],
  },
  {
    id: 'adverbs',
    name: 'Adverbs',
    icon: '⚡',
    colour: 'from-emerald-500 to-teal-500',
    lightBg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    definition: 'An adverb describes a verb, adjective, or another adverb. It tells us HOW, WHEN, WHERE, or HOW MUCH something happens.',
    types: [
      { name: 'How (manner)', examples: ['quickly', 'carefully', 'loudly', 'gently'] },
      { name: 'When (time)', examples: ['yesterday', 'soon', 'always', 'never'] },
      { name: 'Where (place)', examples: ['here', 'outside', 'nearby', 'away'] },
      { name: 'How much', examples: ['very', 'quite', 'almost', 'too'] },
    ],
    tip: 'Tip: Many adverbs end in -ly! Ask "HOW did they do it?" to spot manner adverbs. E.g. She ran quickly → quickly tells HOW.',
    questions: [
      {
        q: 'Which word is an adverb?',
        sentence: 'He whispered quietly in the library.',
        options: ['whispered', 'quietly', 'library', 'the'],
        answer: 'quietly',
        explanation: '"Quietly" tells us HOW he whispered — it\'s an adverb of manner.',
      },
      {
        q: 'What question does the adverb answer in: "She left yesterday."?',
        sentence: 'She left yesterday.',
        options: ['How?', 'Where?', 'When?', 'Why?'],
        answer: 'When?',
        explanation: '"Yesterday" tells us WHEN she left.',
      },
      {
        q: 'Which word is an adverb?',
        sentence: null,
        options: ['bright', 'brightly', 'brightness', 'brighten'],
        answer: 'brightly',
        explanation: '"Brightly" ends in -ly and tells HOW something is done.',
      },
      {
        q: 'Which sentence contains an adverb of PLACE?',
        sentence: null,
        options: [
          'She quickly finished her meal.',
          'He always arrives on time.',
          'The children played outside.',
          'They worked very hard.',
        ],
        answer: 'The children played outside.',
        explanation: '"Outside" tells us WHERE they played.',
      },
      {
        q: 'Turn the adjective "slow" into an adverb:',
        sentence: null,
        options: ['slower', 'slowly', 'slowness', 'slowing'],
        answer: 'slowly',
        explanation: 'Adding -ly to most adjectives makes an adverb: slow → slowly.',
      },
    ],
  },
  {
    id: 'punctuation',
    name: 'Punctuation',
    icon: '❓',
    colour: 'from-cyan-500 to-sky-600',
    lightBg: 'from-cyan-50 to-sky-50',
    border: 'border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-800',
    definition: 'Punctuation marks are symbols that help readers understand sentences — they show pauses, ends of sentences, questions, speech, and more.',
    types: [
      { name: 'Full stop  .', examples: ['Ends a statement sentence.', '"I like dogs."'] },
      { name: 'Question mark  ?', examples: ['Ends a question.', '"Where is my cat?"'] },
      { name: 'Exclamation mark  !', examples: ['Shows strong feeling.', '"Watch out!"'] },
      { name: 'Comma  ,', examples: ['Separates items in a list.', '"I have a dog, a cat, and a fish."'] },
      { name: 'Apostrophe  \'', examples: ['Shows ownership or missing letters.', '"It\'s Tom\'s ball."'] },
      { name: 'Speech marks  " "', examples: ['Shows spoken words.', '"Hello," she said.'] },
    ],
    tip: 'Tip: Every sentence must end with a full stop, question mark, or exclamation mark!',
    questions: [
      {
        q: 'Which punctuation mark should end this sentence: "Where did you go yesterday"',
        sentence: 'Where did you go yesterday',
        options: ['. (full stop)', '? (question mark)', '! (exclamation mark)', ', (comma)'],
        answer: '? (question mark)',
        explanation: 'This is a question, so it needs a question mark.',
      },
      {
        q: 'What does an apostrophe show in "Tom\'s bag"?',
        sentence: "Tom's bag",
        options: ['A list', 'Missing letters', 'Ownership', 'A question'],
        answer: 'Ownership',
        explanation: '"Tom\'s bag" means the bag belongs to Tom.',
      },
      {
        q: 'Which sentence uses a comma correctly?',
        sentence: null,
        options: [
          'I, like, apples.',
          'I like apples, bananas, and grapes.',
          'I like, apples bananas and grapes.',
          'I like apples bananas, and grapes.',
        ],
        answer: 'I like apples, bananas, and grapes.',
        explanation: 'Commas separate items in a list.',
      },
      {
        q: 'Which sentence uses speech marks correctly?',
        sentence: null,
        options: [
          '"Said she hello."',
          'She said, "Hello!"',
          'She "said hello."',
          '"She" said hello.',
        ],
        answer: 'She said, "Hello!"',
        explanation: 'Speech marks wrap the exact words spoken.',
      },
      {
        q: 'Which sentence needs an EXCLAMATION MARK?',
        sentence: null,
        options: [
          'The cat slept on the mat',
          'What is your name',
          'Watch out for the car',
          'I went to the shops',
        ],
        answer: 'Watch out for the car',
        explanation: '"Watch out!" expresses urgent warning — it needs an exclamation mark.',
      },
    ],
  },
  {
    id: 'sentence-types',
    name: 'Sentence Types',
    icon: '📝',
    colour: 'from-amber-500 to-yellow-500',
    lightBg: 'from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    definition: 'Every sentence has a type. The type shows the PURPOSE of the sentence — to tell, ask, command, or exclaim.',
    types: [
      { name: 'Statement', examples: ['Tells us something.', '"The sun is hot."'] },
      { name: 'Question', examples: ['Asks something. Ends with ?', '"Is it hot today?"'] },
      { name: 'Command (imperative)', examples: ['Gives an order or instruction.', '"Close the door."'] },
      { name: 'Exclamation', examples: ['Shows strong feeling. Starts with What/How.', '"What a great day!"'] },
    ],
    tip: 'Tip: A command often starts with a VERB. A question often starts with a question word (Who, What, Where, When, Why, How, Is, Are, Can, Do).',
    questions: [
      {
        q: 'What type of sentence is: "Sit down and be quiet."',
        sentence: 'Sit down and be quiet.',
        options: ['Statement', 'Question', 'Command', 'Exclamation'],
        answer: 'Command',
        explanation: 'It gives an instruction/order, starting with a verb ("Sit") — that makes it a command.',
      },
      {
        q: 'What type of sentence is: "The Earth orbits the Sun."',
        sentence: 'The Earth orbits the Sun.',
        options: ['Statement', 'Question', 'Command', 'Exclamation'],
        answer: 'Statement',
        explanation: 'It tells us a fact — that\'s a statement.',
      },
      {
        q: 'What type of sentence is: "What an incredible goal that was!"',
        sentence: 'What an incredible goal that was!',
        options: ['Statement', 'Question', 'Command', 'Exclamation'],
        answer: 'Exclamation',
        explanation: 'It starts with "What" and shows strong feeling — that\'s an exclamation.',
      },
      {
        q: 'What type of sentence is: "Have you ever seen a rainbow?"',
        sentence: 'Have you ever seen a rainbow?',
        options: ['Statement', 'Question', 'Command', 'Exclamation'],
        answer: 'Question',
        explanation: 'It asks something and ends with a question mark.',
      },
      {
        q: 'Which sentence is a COMMAND?',
        sentence: null,
        options: [
          'The dogs are barking.',
          'Are you ready?',
          'Please wash your hands.',
          'What a surprise!',
        ],
        answer: 'Please wash your hands.',
        explanation: '"Please wash your hands" gives an instruction — it\'s a command.',
      },
    ],
  },
  {
    id: 'pronouns',
    name: 'Pronouns',
    icon: '👤',
    colour: 'from-rose-500 to-pink-500',
    lightBg: 'from-rose-50 to-pink-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800',
    definition: 'A pronoun is a word that takes the place of a noun. Instead of repeating a noun, we use a pronoun to avoid repetition.',
    types: [
      { name: 'Subject pronouns', examples: ['I', 'you', 'he', 'she', 'it', 'we', 'they'] },
      { name: 'Object pronouns', examples: ['me', 'you', 'him', 'her', 'it', 'us', 'them'] },
      { name: 'Possessive pronouns', examples: ['my', 'your', 'his', 'her', 'its', 'our', 'their'] },
    ],
    tip: 'Tip: Pronouns replace nouns to avoid repetition. E.g. "Sarah is kind. She helps people." — "She" replaces "Sarah".',
    questions: [
      {
        q: 'Which word is a pronoun?',
        sentence: 'She gave him the book.',
        options: ['gave', 'him', 'book', 'the'],
        answer: 'him',
        explanation: '"Him" is a pronoun replacing a person\'s name.',
      },
      {
        q: 'Which pronoun should replace "Tom and I" in the next sentence?',
        sentence: 'Tom and I went to the zoo. ___ loved the giraffes.',
        options: ['He', 'They', 'We', 'I'],
        answer: 'We',
        explanation: '"Tom and I" is more than one person, so we use "We".',
      },
      {
        q: 'Which sentence uses a POSSESSIVE pronoun?',
        sentence: null,
        options: [
          'They ran to the park.',
          'She gave him the book.',
          'That is her jacket.',
          'We love to swim.',
        ],
        answer: 'That is her jacket.',
        explanation: '"Her" is a possessive pronoun — it shows the jacket belongs to her.',
      },
      {
        q: 'Which word correctly replaces "the cat" in: "The cat drank its milk."',
        sentence: 'The cat drank its milk.',
        options: ['his', 'their', 'its', 'her'],
        answer: 'its',
        explanation: '"Its" is the possessive pronoun for animals and things.',
      },
      {
        q: 'Rewrite this to avoid repetition. Choose the pronoun for the blank: "Maya loves art. ___ paints every day."',
        sentence: 'Maya loves art. ___ paints every day.',
        options: ['He', 'They', 'She', 'We'],
        answer: 'She',
        explanation: 'Maya is one person (female), so we replace "Maya" with "She".',
      },
    ],
  },
];

const GRADE_GROUPS = [
  { id: 'lower', label: 'Foundation–Year 2', topics: ['nouns', 'verbs', 'adjectives', 'punctuation'] },
  { id: 'middle', label: 'Year 3–4', topics: ['nouns', 'verbs', 'adjectives', 'adverbs', 'punctuation', 'sentence-types'] },
  { id: 'upper', label: 'Year 5–6', topics: ['nouns', 'verbs', 'adjectives', 'adverbs', 'pronouns', 'punctuation', 'sentence-types'] },
];

// ─── Helper Components ────────────────────────────────────────────────────────

const Badge = ({ text, className }) => (
  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${className}`}>{text}</span>
);

const ProgressDots = ({ total, current, correct }) => (
  <div className="flex gap-2 justify-center">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`w-3 h-3 rounded-full transition-all ${
          i < current
            ? correct[i]
              ? 'bg-emerald-500'
              : 'bg-rose-400'
            : i === current
            ? 'bg-indigo-400 scale-125'
            : 'bg-slate-200'
        }`}
      />
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const GrammarWorkshop = ({ showToast = () => {} }) => {
  const [view, setView] = useState('home'); // 'home' | 'learn' | 'quiz' | 'result'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [gradeFilter, setGradeFilter] = useState('upper');
  const [quizIndex, setQuizIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [correctLog, setCorrectLog] = useState([]);
  const [score, setScore] = useState(0);

  const visibleTopicIds = GRADE_GROUPS.find(g => g.id === gradeFilter)?.topics || TOPICS.map(t => t.id);
  const visibleTopics = TOPICS.filter(t => visibleTopicIds.includes(t.id));

  // ── Handlers ──

  const openLearn = useCallback((topic) => {
    setSelectedTopic(topic);
    setView('learn');
  }, []);

  const startQuiz = useCallback((topic) => {
    setSelectedTopic(topic);
    setQuizIndex(0);
    setChosen(null);
    setConfirmed(false);
    setCorrectLog([]);
    setScore(0);
    setView('quiz');
  }, []);

  const handleAnswer = useCallback(() => {
    if (chosen === null || confirmed) return;
    const isCorrect = chosen === selectedTopic.questions[quizIndex].answer;
    setConfirmed(true);
    setCorrectLog(prev => [...prev, isCorrect]);
    if (isCorrect) setScore(s => s + 1);
  }, [chosen, confirmed, quizIndex, selectedTopic]);

  const nextQuestion = useCallback(() => {
    if (quizIndex + 1 >= selectedTopic.questions.length) {
      setView('result');
    } else {
      setQuizIndex(i => i + 1);
      setChosen(null);
      setConfirmed(false);
    }
  }, [quizIndex, selectedTopic]);

  const goHome = useCallback(() => {
    setView('home');
    setSelectedTopic(null);
    setChosen(null);
    setConfirmed(false);
    setCorrectLog([]);
    setScore(0);
    setQuizIndex(0);
  }, []);

  // ── Derived ──
  const totalQuestions = selectedTopic?.questions?.length || 0;
  const currentQuestion = selectedTopic?.questions?.[quizIndex] || null;
  const pct = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;

  const getResultEmoji = (p) => {
    if (p === 100) return '🏆';
    if (p >= 80) return '🌟';
    if (p >= 60) return '👍';
    if (p >= 40) return '📚';
    return '💪';
  };

  const getResultMessage = (p) => {
    if (p === 100) return 'Perfect score! You\'re a grammar superstar!';
    if (p >= 80) return 'Excellent work! Almost perfect!';
    if (p >= 60) return 'Good effort! Keep practising!';
    if (p >= 40) return 'Nice try! Review the lesson and try again.';
    return 'Don\'t give up! Read the lesson notes and try again.';
  };

  // ─── Views ────────────────────────────────────────────────────────────────

  // HOME
  if (view === 'home') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">✏️</span>
            <div>
              <h2 className="text-2xl font-bold">Grammar Workshop</h2>
              <p className="opacity-90 text-sm">Learn grammar rules and practise with fun quizzes</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="bg-white/20 rounded-full px-3 py-1 text-sm">{TOPICS.length} grammar topics</span>
            <span className="bg-white/20 rounded-full px-3 py-1 text-sm">{TOPICS.reduce((s, t) => s + t.questions.length, 0)} quiz questions</span>
            <span className="bg-white/20 rounded-full px-3 py-1 text-sm">Ages 6–12</span>
          </div>
        </div>

        {/* Year Level Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
          <p className="text-sm font-semibold text-slate-600 mb-3">Filter by Year Level:</p>
          <div className="flex flex-wrap gap-2">
            {GRADE_GROUPS.map(g => (
              <button
                key={g.id}
                onClick={() => setGradeFilter(g.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  gradeFilter === g.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                {g.label}
              </button>
            ))}
            <button
              onClick={() => setGradeFilter('upper')}
              className="px-4 py-2 rounded-lg font-semibold text-sm bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
            >
              Show All
            </button>
          </div>
        </div>

        {/* Topic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleTopics.map(topic => (
            <div
              key={topic.id}
              className={`rounded-2xl border ${topic.border} bg-gradient-to-br ${topic.lightBg} shadow-sm hover:shadow-md transition-all overflow-hidden`}
            >
              {/* Card header */}
              <div className={`bg-gradient-to-r ${topic.colour} p-4 text-white`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{topic.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg">{topic.name}</h3>
                    <p className="text-xs opacity-90">{topic.questions.length} quiz questions</p>
                  </div>
                </div>
              </div>
              {/* Card body */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-slate-700 leading-relaxed">{topic.definition}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openLearn(topic)}
                    className="flex-1 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all hover:border-indigo-300 hover:text-indigo-700"
                  >
                    📖 Learn
                  </button>
                  <button
                    onClick={() => startQuiz(topic)}
                    className={`flex-1 py-2 rounded-lg bg-gradient-to-r ${topic.colour} text-white text-sm font-semibold shadow hover:opacity-90 transition-all`}
                  >
                    🎯 Quiz
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // LEARN VIEW
  if (view === 'learn' && selectedTopic) {
    return (
      <div className="space-y-5 max-w-3xl mx-auto">
        {/* Back bar */}
        <div className="bg-white rounded-xl shadow-sm p-3 flex items-center justify-between border border-slate-200">
          <button onClick={goHome} className="text-slate-600 hover:text-indigo-600 font-semibold text-sm flex items-center gap-1">
            ← All Topics
          </button>
          <button
            onClick={() => startQuiz(selectedTopic)}
            className={`px-4 py-2 rounded-lg bg-gradient-to-r ${selectedTopic.colour} text-white text-sm font-bold shadow hover:opacity-90 transition-all`}
          >
            Start Quiz →
          </button>
        </div>

        {/* Topic heading */}
        <div className={`bg-gradient-to-r ${selectedTopic.colour} rounded-2xl p-6 text-white shadow-lg`}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{selectedTopic.icon}</span>
            <div>
              <h2 className="text-2xl font-bold">{selectedTopic.name}</h2>
              <p className="opacity-90 mt-1 text-sm">{selectedTopic.definition}</p>
            </div>
          </div>
        </div>

        {/* Types / Examples */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Types &amp; Examples</h3>
          <div className="space-y-4">
            {selectedTopic.types.map((type, i) => (
              <div key={i} className={`rounded-xl p-4 bg-gradient-to-br ${selectedTopic.lightBg} border ${selectedTopic.border}`}>
                <p className="font-bold text-slate-800 mb-2">{type.name}</p>
                <div className="flex flex-wrap gap-2">
                  {type.examples.map((ex, j) => (
                    <span key={j} className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedTopic.badge}`}>
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <span className="text-2xl">💡</span>
          <p className="text-amber-800 text-sm leading-relaxed font-medium">{selectedTopic.tip}</p>
        </div>

        {/* Start quiz CTA */}
        <button
          onClick={() => startQuiz(selectedTopic)}
          className={`w-full py-4 rounded-2xl bg-gradient-to-r ${selectedTopic.colour} text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all`}
        >
          🎯 Take the {selectedTopic.name} Quiz →
        </button>
      </div>
    );
  }

  // QUIZ VIEW
  if (view === 'quiz' && selectedTopic && currentQuestion) {
    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        {/* Back bar */}
        <div className="bg-white rounded-xl shadow-sm p-3 flex items-center justify-between border border-slate-200">
          <button onClick={goHome} className="text-slate-600 hover:text-indigo-600 font-semibold text-sm">
            ← All Topics
          </button>
          <button onClick={() => openLearn(selectedTopic)} className="text-slate-500 hover:text-indigo-500 text-sm">
            📖 Review Lesson
          </button>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className={`font-bold text-sm bg-gradient-to-r ${selectedTopic.colour} bg-clip-text text-transparent`}>
              {selectedTopic.icon} {selectedTopic.name} Quiz
            </span>
            <span className="text-sm text-slate-500">Question {quizIndex + 1} of {totalQuestions}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${selectedTopic.colour} transition-all`}
              style={{ width: `${((quizIndex) / totalQuestions) * 100}%` }}
            />
          </div>
          <ProgressDots total={totalQuestions} current={quizIndex} correct={correctLog} />
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-5">
          <p className="text-lg font-bold text-slate-800">{currentQuestion.q}</p>
          {currentQuestion.sentence && (
            <div className={`bg-gradient-to-br ${selectedTopic.lightBg} border ${selectedTopic.border} rounded-xl px-5 py-3`}>
              <p className="font-mono text-base text-slate-700 italic">&ldquo;{currentQuestion.sentence}&rdquo;</p>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, i) => {
              let cls = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-indigo-50 hover:border-indigo-300';
              if (confirmed) {
                if (opt === currentQuestion.answer) {
                  cls = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                } else if (opt === chosen && chosen !== currentQuestion.answer) {
                  cls = 'bg-rose-50 border-rose-400 text-rose-800';
                } else {
                  cls = 'bg-slate-50 border-slate-200 text-slate-400';
                }
              } else if (chosen === opt) {
                cls = 'bg-indigo-50 border-indigo-400 text-indigo-800 font-semibold';
              }
              return (
                <button
                  key={i}
                  disabled={confirmed}
                  onClick={() => setChosen(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${cls} ${!confirmed ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span className="mr-2 font-bold text-slate-400">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                  {confirmed && opt === currentQuestion.answer && ' ✓'}
                  {confirmed && opt === chosen && chosen !== currentQuestion.answer && ' ✗'}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {confirmed && (
            <div className={`rounded-xl p-4 ${chosen === currentQuestion.answer ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
              <p className={`font-bold mb-1 ${chosen === currentQuestion.answer ? 'text-emerald-700' : 'text-rose-700'}`}>
                {chosen === currentQuestion.answer ? '✅ Correct!' : '❌ Not quite!'}
              </p>
              <p className="text-sm text-slate-700">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {!confirmed ? (
              <button
                disabled={chosen === null}
                onClick={handleAnswer}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  chosen !== null
                    ? `bg-gradient-to-r ${selectedTopic.colour} text-white shadow-md hover:opacity-90`
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className={`flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r ${selectedTopic.colour} text-white shadow-md hover:opacity-90 transition-all`}
              >
                {quizIndex + 1 < totalQuestions ? 'Next Question →' : 'See Results 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RESULTS VIEW
  if (view === 'result' && selectedTopic) {
    return (
      <div className="space-y-5 max-w-xl mx-auto">
        {/* Result card */}
        <div className={`bg-gradient-to-br ${selectedTopic.colour} rounded-2xl p-8 text-white text-center shadow-xl`}>
          <div className="text-6xl mb-3">{getResultEmoji(pct)}</div>
          <h2 className="text-2xl font-bold mb-1">{selectedTopic.name} Quiz Complete!</h2>
          <p className="opacity-90 mb-5">{getResultMessage(pct)}</p>
          <div className="bg-white/20 rounded-2xl p-5">
            <p className="text-5xl font-bold">{score}/{totalQuestions}</p>
            <p className="text-lg opacity-90">{pct}%</p>
          </div>
        </div>

        {/* Question breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 mb-3">Question Breakdown</h3>
          <div className="space-y-2">
            {selectedTopic.questions.map((q, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${correctLog[i] ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <span className="text-lg">{correctLog[i] ? '✅' : '❌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{q.q}</p>
                  {!correctLog[i] && (
                    <p className="text-xs text-rose-700 mt-0.5">Answer: <strong>{q.answer}</strong></p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => startQuiz(selectedTopic)}
            className={`py-3 rounded-xl font-bold text-sm bg-gradient-to-r ${selectedTopic.colour} text-white shadow-md hover:opacity-90 transition-all`}
          >
            🔄 Try Again
          </button>
          <button
            onClick={() => openLearn(selectedTopic)}
            className="py-3 rounded-xl font-bold text-sm bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition-all"
          >
            📖 Review Lesson
          </button>
          <button
            onClick={goHome}
            className="col-span-2 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow hover:bg-indigo-700 transition-all"
          >
            🏠 Choose Another Topic
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default GrammarWorkshop;
