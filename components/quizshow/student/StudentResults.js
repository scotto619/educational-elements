// components/quizshow/student/StudentResults.js — STUDENT FINAL RESULTS
// Personal result card with rank, accuracy and streak, team outcome for
// Team Battle, plus the top of the leaderboard.
import React, { useState, useEffect } from 'react';
import { triggerConfetti, playQuizSound } from '../../../utils/quizShowHelpers';

const StudentResults = ({
  results,
  playerInfo,
  onPlayAgain,
  onLeaveGame,
  getAvatarImage
}) => {
  const [personalStats, setPersonalStats] = useState(null);
  const [rank, setRank] = useState(0);

  useEffect(() => {
    if (!results || !playerInfo) return;
    const playerResult = results.find(r => r.playerId === playerInfo.playerId);
    const playerRank = results.findIndex(r => r.playerId === playerInfo.playerId) + 1;
    setPersonalStats(playerResult);
    setRank(playerRank);

    if (playerRank > 0 && playerRank <= 3) {
      setTimeout(() => {
        triggerConfetti();
        playQuizSound('gameEnd');
      }, 500);
    }
  }, [results, playerInfo]);

  if (!personalStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-3xl font-black mb-3">Results Not Found</h1>
          <p className="text-slate-400 mb-8">We couldn't load your game results.</p>
          <button onClick={onLeaveGame}
            className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition">
            Return to Portal
          </button>
        </div>
      </div>
    );
  }

  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  const headline = rank === 1 ? 'CHAMPION!' : rank === 2 ? 'So Close!' : rank === 3 ? 'On the Podium!' : `You placed ${rank}th`;
  const heroGradient = rank === 1
    ? 'from-amber-500 via-orange-600 to-rose-600'
    : rank <= 3
      ? 'from-fuchsia-600 via-purple-700 to-indigo-800'
      : 'from-slate-800 via-indigo-900 to-slate-900';

  // Team outcome (calculateFinalLeaderboard attaches team fields per player)
  const isTeamGame = Boolean(personalStats.teamId);
  let teamSummary = null;
  if (isTeamGame) {
    const byTeam = {};
    results.forEach(r => {
      if (!r.teamId) return;
      if (!byTeam[r.teamId]) byTeam[r.teamId] = { teamId: r.teamId, name: r.teamName, emoji: r.teamEmoji, color: r.teamColor, total: 0, count: 0 };
      byTeam[r.teamId].total += r.totalScore;
      byTeam[r.teamId].count += 1;
    });
    const teams = Object.values(byTeam).map(t => ({ ...t, avg: t.count ? Math.round(t.total / t.count) : 0 }))
      .sort((a, b) => b.avg - a.avg);
    const myTeamRank = teams.findIndex(t => t.teamId === personalStats.teamId) + 1;
    teamSummary = { teams, myTeamRank };
  }

  const top5 = results.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-4">
      <div className="max-w-xl mx-auto space-y-5 pb-10 pt-4">

        {/* Hero card */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${heroGradient} p-8 text-center shadow-2xl`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_65%)]" />
          <div className="relative">
            <div className="text-7xl mb-2">{medal || '🎮'}</div>
            <h1 className="text-4xl font-black text-white mb-1">{headline}</h1>
            {personalStats.eliminated && (
              <p className="text-white/80 font-semibold">💀 Eliminated at Q{(personalStats.eliminatedAtQuestion ?? 0) + 1} — great run!</p>
            )}

            <div className="mt-5 flex items-center justify-center gap-4">
              <img src={personalStats.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt="avatar"
                className="w-16 h-16 rounded-full border-4 border-white/50 shadow-xl" />
              <div className="text-left">
                <p className="text-white font-black text-xl leading-tight">{personalStats.name}</p>
                {isTeamGame && (
                  <p className="text-white/85 font-bold">{personalStats.teamEmoji} {personalStats.teamName}</p>
                )}
              </div>
            </div>

            <p className="text-6xl font-black text-white mt-5 drop-shadow">{personalStats.totalScore.toLocaleString()}</p>
            <p className="text-white/75 font-semibold">points · rank {rank} of {results.length}</p>
          </div>
        </div>

        {/* Team outcome */}
        {teamSummary && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <h3 className="font-black text-white mb-3 text-center">
              {teamSummary.myTeamRank === 1 ? '👑 Your team WON!' : `🛡️ Your team came ${teamSummary.myTeamRank}${teamSummary.myTeamRank === 2 ? 'nd' : teamSummary.myTeamRank === 3 ? 'rd' : 'th'}`}
            </h3>
            <div className="space-y-2">
              {teamSummary.teams.map((t, i) => (
                <div key={t.teamId}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 border"
                  style={{ borderColor: `${t.color}66`, background: t.teamId === personalStats.teamId ? `${t.color}20` : 'rgba(255,255,255,0.03)' }}>
                  <span className="font-black text-slate-400 w-5">{i + 1}</span>
                  <span className="font-black" style={{ color: t.color }}>{t.emoji} {t.name}</span>
                  <span className="ml-auto font-black text-white">{t.avg.toLocaleString()}</span>
                  <span className="text-xs text-slate-500">avg</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-emerald-300">{personalStats.correctAnswers}<span className="text-slate-500 text-base">/{personalStats.totalQuestions}</span></p>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Correct</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-sky-300">{personalStats.accuracy}%</p>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Accuracy</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-orange-300">🔥 {personalStats.bestStreak || 0}</p>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Best Streak</p>
          </div>
        </div>

        {personalStats.bonusPoints > 0 && (
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-3 text-center">
            <p className="text-amber-300 font-bold text-sm">⚡ +{personalStats.bonusPoints.toLocaleString()} bonus points{personalStats.raceBonus > 0 ? ' (incl. race finish bonus!)' : ' from minigames!'}</p>
          </div>
        )}

        {/* Top 5 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
          <h3 className="font-black text-white mb-3">🏆 Top of the Class</h3>
          <div className="space-y-2">
            {top5.map((player, i) => {
              const isMe = player.playerId === playerInfo?.playerId;
              return (
                <div key={player.playerId}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${isMe ? 'bg-amber-500/15 border-amber-400/50' : 'bg-white/5 border-white/10'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                    i === 0 ? 'bg-amber-400 text-amber-950' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-orange-400 text-orange-950' : 'bg-white/10 text-slate-300'
                  }`}>{i + 1}</span>
                  <img src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt={player.name}
                    className="w-9 h-9 rounded-full border-2 border-white/20 shrink-0" />
                  <p className={`flex-1 font-bold truncate ${isMe ? 'text-amber-300' : 'text-white'}`}>
                    {isMe ? `${player.name} (you!)` : player.name}
                  </p>
                  <p className="font-black text-fuchsia-300 shrink-0">{player.totalScore.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
          {rank > 5 && (
            <p className="text-center text-slate-400 text-sm mt-3">…and you at <strong className="text-white">#{rank}</strong></p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white py-3.5 rounded-2xl font-black hover:brightness-110 transition-all shadow-lg">
            🔁 Play Again
          </button>
          <button onClick={onLeaveGame}
            className="flex-1 bg-white/10 border border-white/15 text-slate-200 py-3.5 rounded-2xl font-bold hover:bg-white/20 transition-colors">
            🏠 Back to Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
