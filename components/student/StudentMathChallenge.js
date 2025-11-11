import React, { useMemo, useState } from 'react';
import { DAILY_MATH_CHALLENGES } from '../curriculum/mathematics/data/dailyChallenges';

const StudentMathChallenge = ({ classData, showToast = () => {} }) => {
  const assignment = classData?.toolkitData?.mathDailyChallenges;
  const assignedChallengeId = assignment?.assignedChallengeId;

  const challenge = useMemo(
    () => DAILY_MATH_CHALLENGES.find((item) => item.id === assignedChallengeId) || null,
    [assignedChallengeId]
  );

  const [completedSteps, setCompletedSteps] = useState(() => new Set());
  const [reflection, setReflection] = useState('');

  const toggleStep = (index) => {
    setCompletedSteps((prev) => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
  };

  const handleCopyInstructions = async () => {
    if (!challenge) return;

    const text = [
      `${challenge.title} (${challenge.strand})`,
      challenge.description,
      '',
      'Steps:',
      ...challenge.taskSteps.map((step, index) => `${index + 1}. ${step}`),
      '',
      'Success Criteria:',
      ...challenge.successCriteria.map((criterion) => `• ${criterion}`)
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      showToast('Challenge copied to clipboard! Paste it into your notes.', 'success');
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      showToast('Copy not supported on this device. Try selecting the text instead.', 'info');
    }
  };

  if (!challenge) {
    return (
      <div className="bg-white border border-yellow-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="text-4xl mb-4">🧩</div>
        <h2 className="text-2xl font-bold text-yellow-700 mb-2">No challenge set… yet!</h2>
        <p className="text-yellow-800">
          Your teacher hasn’t assigned a daily maths challenge right now. Check back soon for a new mission.
        </p>
      </div>
    );
  }

  const dueDate = assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-8 shadow-lg">
        <p className="uppercase text-xs tracking-[0.4em] text-white/70 font-semibold">Teacher Challenge</p>
        <h1 className="text-3xl md:text-4xl font-black mt-2 mb-3 flex items-center gap-3">
          <span role="img" aria-hidden="true">🎯</span>
          {challenge.title}
        </h1>
        <p className="text-lg text-white/85 max-w-3xl">{challenge.headline}</p>
        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">{challenge.strand}</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">{challenge.difficulty}</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">{challenge.estimatedMinutes} minute mission</span>
          {dueDate && (
            <span className="bg-black/20 px-3 py-1 rounded-full">Due {dueDate}</span>
          )}
        </div>
        {assignment?.customMessage && (
          <p className="mt-4 text-sm italic text-white/85">Teacher note: “{assignment.customMessage}”</p>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Mission Brief</h2>
          <p className="text-slate-600 leading-relaxed">{challenge.description}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Follow These Steps</h2>
          <ol className="space-y-3">
            {challenge.taskSteps.map((step, index) => (
              <li
                key={step}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                  completedSteps.has(index)
                    ? 'border-green-200 bg-green-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleStep(index)}
                  className={`mt-1 h-6 w-6 flex items-center justify-center rounded-full border-2 font-semibold ${
                    completedSteps.has(index)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-300 text-slate-400'
                  }`}
                  aria-pressed={completedSteps.has(index)}
                >
                  {completedSteps.has(index) ? '✓' : index + 1}
                </button>
                <div>
                  <p className="text-slate-800 font-semibold">Step {index + 1}</p>
                  <p className="text-slate-600 leading-relaxed">{step}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Success Criteria</h2>
          <ul className="space-y-2">
            {challenge.successCriteria.map((criterion) => (
              <li key={criterion} className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-slate-700">
                <span className="font-semibold text-indigo-600 mr-2">★</span>
                {criterion}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Math Talk Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {challenge.mathTalkQuestions.map((question) => (
              <div key={question} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700">
                <span className="text-indigo-500 mr-2">💬</span>
                {question}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Recommended Tools</h2>
          <div className="flex flex-wrap gap-2">
            {challenge.materials.map((material) => (
              <span key={material} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                {material}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-indigo-700 mb-2">Extension Idea</h2>
          <p className="text-indigo-700">{challenge.extension}</p>
        </section>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Reflect on Your Learning</h2>
        <p className="text-slate-600 text-sm">
          Jot down how you tackled the challenge, any discoveries, or questions you still have. This stays private unless you share it with your teacher.
        </p>
        <textarea
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
          placeholder="Today I tried… I noticed… Next time I could…"
          rows={4}
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
        ></textarea>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopyInstructions}
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Copy Challenge to Clipboard
          </button>
          <span className="text-xs text-slate-500 self-center">
            Tip: Paste into your maths journal or digital notebook to track your progress.
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentMathChallenge;
