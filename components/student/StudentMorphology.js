import React from 'react';
import MorphologyLevel1 from '../curriculum/literacy/morphology/MorphologyLevel1';
import MorphologyLevel2 from '../curriculum/literacy/morphology/MorphologyLevel2';

const LEVEL_MAP = {
  1: MorphologyLevel1,
  2: MorphologyLevel2
};

const buildFallbackContent = (lesson = {}, levelData = {}) => ({
  hero: {
    emoji: lesson.icon || '🧠',
    title: lesson.title || 'Morphology Mission',
    subtitle: levelData.levelInfo?.title || 'Word Power',
    gradient: levelData.levelInfo?.color || 'from-purple-500 via-pink-500 to-indigo-500'
  },
  ruleFocus: {
    title: 'What we are learning',
    description:
      lesson.objectives?.[0] ||
      'Explore how prefixes, bases and suffixes work together to build words.',
    keyPoints: lesson.objectives?.slice(0, 3) || [
      'Look closely at each part of the word.',
      'Say the word aloud to hear the changes.',
      'Use the meaning to help you choose the right parts.'
    ],
    examples: []
  },
  quickCheck: {
    question: 'Tell someone at home one new word you learned today.',
    answers: [],
    celebration: 'Keep exploring!' },
  practice: [],
  exitTicket: lesson.assessment?.exitTicket || 'Draw or write a new word using today\'s rule.'
});

const StudentMorphology = ({ classData }) => {
  const sharedLessonRef = classData?.toolkitData?.morphology?.currentLesson;

  if (!sharedLessonRef) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-200 px-6 py-8 text-center max-w-md">
          <div className="text-5xl mb-3">🧠</div>
          <h2 className="text-xl font-bold text-blue-800 mb-2">Morphology Adventure Coming Soon</h2>
          <p className="text-blue-700 text-sm">
            Your teacher hasn\'t shared today\'s Morphology Master mission yet. Check back after class for a colourful recap and
            practice games!
          </p>
        </div>
      </div>
    );
  }

  const levelData = LEVEL_MAP[sharedLessonRef.level];
  const lesson = levelData?.lessons?.find((item) => item.id === sharedLessonRef.lessonId);

  if (!levelData || !lesson) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-rose-200 px-6 py-8 text-center max-w-md">
          <div className="text-5xl mb-3">🔍</div>
          <h2 className="text-xl font-bold text-rose-700 mb-2">We couldn\'t load that lesson</h2>
          <p className="text-rose-600 text-sm">
            Please ask your teacher to re-share the Morphology lesson so you can see the activities here.
          </p>
        </div>
      </div>
    );
  }

  const content = lesson.studentPortalContent || buildFallbackContent(lesson, levelData);
  const heroGradient = content.hero?.gradient
    ? `bg-gradient-to-r ${content.hero.gradient}`
    : 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500';
  const practiceCards = Array.isArray(content.practice) ? content.practice : [];
  const quickCheckAnswers = Array.isArray(content.quickCheck?.answers)
    ? content.quickCheck.answers
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6 space-y-6">
      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl shadow-2xl text-white ${heroGradient}`}>
        <div className="absolute inset-0 bg-black/15"></div>
        <div className="relative z-10 p-6 sm:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="uppercase tracking-[0.35em] text-xs sm:text-sm font-semibold text-white/75 mb-2">
                Morphology Masters · Level {sharedLessonRef.level}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold flex items-center gap-3">
                <span>{content.hero?.emoji || lesson.icon || '🧠'}</span>
                {content.hero?.title || lesson.title}
              </h1>
              <p className="text-white/85 text-sm sm:text-base mt-2 max-w-xl">
                {content.hero?.subtitle || levelData.levelInfo?.title}
              </p>
              {sharedLessonRef.sharedAt && (
                <p className="text-white/70 text-xs sm:text-sm mt-3">
                  Shared {new Date(sharedLessonRef.sharedAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-4 border border-white/30 max-w-sm">
              <h2 className="text-lg font-semibold text-white mb-2">Today\'s Mission</h2>
              <p className="text-white/85 text-sm leading-relaxed">
                {content.ruleFocus?.description ||
                  'Explore how word parts connect. Try the activities below to become a Morphology Master!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rule Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-blue-100 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span>✨</span> {content.ruleFocus?.title || 'What we\'re focusing on'}
          </h3>
          <ul className="space-y-2 text-blue-700 text-sm sm:text-base">
            {(content.ruleFocus?.keyPoints || []).map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 rounded-3xl shadow-xl border border-amber-100 p-6">
          <h4 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
            <span>🪄</span> Word Spotlight
          </h4>
          <div className="space-y-3">
            {(content.ruleFocus?.examples || []).map((example, index) => (
              <div key={index} className="bg-white/80 rounded-2xl px-4 py-3">
                <div className="text-sm font-bold text-amber-700">{example.word}</div>
                {example.breakdown && (
                  <div className="text-xs text-amber-600">{example.breakdown}</div>
                )}
                {example.meaning && (
                  <div className="text-xs text-amber-700 mt-1">{example.meaning}</div>
                )}
              </div>
            ))}
            {(!content.ruleFocus || !content.ruleFocus.examples || content.ruleFocus.examples.length === 0) && (
              <div className="bg-white/80 rounded-2xl px-4 py-3 text-xs text-amber-700">
                Think of a word from class and explain how the parts change its meaning.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Check */}
      {content.quickCheck && (
        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-purple-900 mb-2 flex items-center gap-2">
            <span>🤔</span> Quick Check
          </h3>
          <p className="text-purple-700 text-base sm:text-lg mb-4">
            {content.quickCheck.question}
          </p>
          {quickCheckAnswers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickCheckAnswers.map((answer, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold"
                >
                  {answer}
                </span>
              ))}
            </div>
          )}
          {content.quickCheck.celebration && (
            <p className="text-purple-600 text-sm mt-4">{content.quickCheck.celebration}</p>
          )}
        </div>
      )}

      {/* Practice Activities */}
      {practiceCards.length > 0 && (
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <span>🎮</span> Practice Time
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {practiceCards.map((activity, index) => (
              <div
                key={index}
                className={`rounded-3xl border border-indigo-100 shadow-lg p-6 ${
                  activity.background ? `bg-gradient-to-br ${activity.background}` : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{activity.icon || '🎯'}</div>
                  <div>
                    <h4 className="text-lg font-bold text-white drop-shadow-sm">
                      {activity.title}
                    </h4>
                    <p className="text-white/90 text-sm">{activity.description}</p>
                  </div>
                </div>
                <ul className="bg-white/80 rounded-2xl px-4 py-3 text-sm text-indigo-800 space-y-2">
                  {(activity.steps || []).map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2">
                      <span className="text-indigo-500">➤</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exit Ticket */}
      {content.exitTicket && (
        <div className="bg-white rounded-3xl shadow-xl border border-teal-100 p-6">
          <h3 className="text-lg font-bold text-teal-900 mb-2 flex items-center gap-2">
            <span>📝</span> Exit Ticket Challenge
          </h3>
          <p className="text-teal-700 text-sm sm:text-base">{content.exitTicket}</p>
        </div>
      )}
    </div>
  );
};

export default StudentMorphology;
