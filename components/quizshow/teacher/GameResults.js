// components/quizshow/teacher/GameResults.js — DETAILED RECAP
// Post-game teaching insights: class stats, question-by-question breakdown
// (spot the tricky ones!), and the full player table.
import React from 'react';
import { GAME_MODES } from '../../../utils/quizShowHelpers';

const GameResults = ({ results = [], gameData, onDone, getAvatarImage }) => {
  const modeInfo = GAME_MODES[gameData?.mode] || GAME_MODES.classic;
  const questions = gameData?.quiz?.questions || [];
  const responses = gameData?.responses || {};

  // Class stats
  const totalPlayers = results.length;
  const avgScore = totalPlayers ? Math.round(results.reduce((s, r) => s + r.totalScore, 0) / totalPlayers) : 0;
  const avgAccuracy = totalPlayers ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / totalPlayers) : 0;
  const bestStreak = results.reduce((m, r) => Math.max(m, r.bestStreak || 0), 0);
  const bestStreaker = results.find(r => (r.bestStreak || 0) === bestStreak);

  // Per-question breakdown
  const questionStats = questions.map((q, i) => {
    const resp = Object.values(responses[i] || {});
    const answered = resp.length;
    const correct = resp.filter(r => r.isCorrect).length;
    const pctCorrect = answered ? Math.round((correct / answered) * 100) : 0;
    const avgTime = answered ? (resp.reduce((s, r) => s + (r.timeSpent || 0), 0) / answered) : 0;
    return { q, index: i, answered, correct, pctCorrect, avgTime };
  });

  const hardest = [...questionStats].filter(s => s.answered > 0).sort((a, b) => a.pctCorrect - b.pctCorrect)[0];

  const barColor = (pct) => pct >= 75 ? 'bg-emerald-500' : pct >= 45 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="rounded-3xl bg-slate-950 border border-white/10 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${modeInfo.gradient} px-6 md:px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <h1 className="text-3xl font-black text-white">📊 Game Recap</h1>
          <p className="text-white/85 font-semibold mt-1">{gameData?.quiz?.title} · {modeInfo.icon} {modeInfo.name}</p>
        </div>
        <button onClick={onDone}
          className="self-start md:self-auto bg-black/25 border border-white/30 text-white px-6 py-3 rounded-xl font-black hover:bg-black/40 transition">
          ✨ Back to Dashboard
        </button>
      </div>

      <div className="p-6 md:p-10 space-y-8">
        {/* Stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-white">{totalPlayers}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Players</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-fuchsia-300">{avgScore.toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Avg Score</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-emerald-300">{avgAccuracy}%</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Avg Accuracy</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-amber-300">🔥 {bestStreak}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 truncate">
              Best streak{bestStreaker && bestStreak > 1 ? ` — ${bestStreaker.name}` : ''}
            </p>
          </div>
        </div>

        {/* Question breakdown */}
        <div>
          <h2 className="text-xl font-black text-white mb-1">❓ Question Breakdown</h2>
          <p className="text-sm text-slate-400 mb-4">
            {hardest ? <>Trickiest question: <span className="text-rose-300 font-bold">Q{hardest.index + 1}</span> — only {hardest.pctCorrect}% got it right. Worth revisiting!</> : 'How the class went, question by question.'}
          </p>
          <div className="space-y-2.5">
            {questionStats.map(({ q, index, answered, correct, pctCorrect, avgTime }) => (
              <div key={index} className={`rounded-2xl border p-4 ${hardest?.index === index ? 'border-rose-400/40 bg-rose-500/5' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <p className="font-bold text-white flex-1 min-w-[200px]">
                    <span className="text-slate-500 mr-2">Q{index + 1}</span>{q.question}
                  </p>
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-300 shrink-0">
                    <span>✔ {correct}/{answered}</span>
                    <span>⏱ {avgTime.toFixed(1)}s avg</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor(pctCorrect)} transition-all`} style={{ width: `${pctCorrect}%` }} />
                  </div>
                  <span className={`font-black text-sm w-12 text-right ${pctCorrect >= 75 ? 'text-emerald-300' : pctCorrect >= 45 ? 'text-amber-300' : 'text-rose-300'}`}>
                    {pctCorrect}%
                  </span>
                </div>
                {q.type !== 'estimation' && q.options?.[q.correctAnswer] !== undefined && (
                  <p className="text-xs text-slate-500 mt-2">Answer: <span className="text-emerald-300 font-semibold">{q.options[q.correctAnswer]}</span></p>
                )}
                {q.type === 'estimation' && (
                  <p className="text-xs text-slate-500 mt-2">Answer: <span className="text-emerald-300 font-semibold">{q.answerValue?.toLocaleString()} {q.unit}</span></p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Player table */}
        <div>
          <h2 className="text-xl font-black text-white mb-4">🏅 Final Standings</h2>
          <div className="space-y-2">
            {results.map((player, i) => (
              <div key={player.playerId} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center font-black shrink-0 ${
                  i === 0 ? 'bg-amber-400 text-amber-950' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-orange-400 text-orange-950' : 'bg-white/10 text-slate-300'
                }`}>{i + 1}</span>
                <img src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt={player.name}
                  className="w-10 h-10 rounded-full border-2 border-white/20 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">
                    {player.name}
                    {player.teamName && <span className="ml-2 text-xs font-semibold" style={{ color: player.teamColor }}>{player.teamEmoji} {player.teamName}</span>}
                    {player.eliminated && <span className="ml-2 text-xs text-rose-400 font-semibold">💀 out Q{(player.eliminatedAtQuestion ?? 0) + 1}</span>}
                  </p>
                  <p className="text-xs text-slate-400">
                    {player.correctAnswers}/{player.totalQuestions} correct · {player.accuracy}% accuracy
                    {player.bestStreak > 1 ? ` · 🔥 ${player.bestStreak} streak` : ''}
                    {player.bonusPoints > 0 ? ` · +${player.bonusPoints} bonus` : ''}
                  </p>
                </div>
                <p className="font-black text-lg text-fuchsia-300 shrink-0">{player.totalScore.toLocaleString()}</p>
              </div>
            ))}
            {results.length === 0 && (
              <p className="text-center text-slate-500 py-8">No results recorded for this game.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameResults;
