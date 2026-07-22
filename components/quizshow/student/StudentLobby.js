// components/quizshow/student/StudentLobby.js — STUDENT WAITING ROOM
// Arena styling, live player wall, your team reveal, and an emoji reaction
// bar that fires reactions onto the teacher's big screen.
import React, { useState, useEffect, useRef } from 'react';
import { playQuizSound, GAME_MODES, getTeamForPlayer, getPowerUpsForMode } from '../../../utils/quizShowHelpers';
import { ReactionBar, ReactionOverlay } from '../shared/Reactions';

const StudentLobby = ({ roomCode, gameData, playerInfo, onLeaveGame }) => {
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const countdownStartedRef = useRef(false);

  const mode = GAME_MODES[gameData?.mode] || GAME_MODES.classic;
  const myTeam = gameData?.mode === 'team' ? getTeamForPlayer(gameData?.teams, playerInfo?.playerId) : null;
  const powerUps = gameData?.settings?.powerUpsEnabled !== false ? getPowerUpsForMode(gameData?.mode || 'classic') : [];

  useEffect(() => {
    if (gameData?.players) {
      setPlayers(Object.entries(gameData.players).map(([id, player]) => ({ id, ...player })));
    }
    if (gameData?.status === 'playing' && !countdownStartedRef.current) {
      countdownStartedRef.current = true;
      startCountdown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData]);

  const startCountdown = () => {
    playQuizSound('gameStart');
    let count = 3;
    setCountdown(count);
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playQuizSound('tick');
      } else {
        setCountdown('GO!');
        clearInterval(timer);
      }
    }, 1000);
  };

  // Full-screen countdown
  if (countdown !== null) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center z-50">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-8 animate-pulse">Get Ready!</h1>
          {countdown === 'GO!' ? (
            <div className="animate-bounce">
              <div className="text-8xl md:text-9xl font-black text-emerald-400 drop-shadow-2xl">GO!</div>
              <div className="text-5xl mt-4">🎉</div>
            </div>
          ) : (
            <div className="text-[10rem] leading-none font-black text-white animate-pulse drop-shadow-2xl">
              {countdown}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-4 relative">
      <ReactionOverlay reactions={gameData?.reactions} showNames={false} />
      <div className="max-w-3xl mx-auto space-y-5 pb-8">

        {/* Header */}
        <div className={`relative overflow-hidden bg-gradient-to-r ${mode.gradient} rounded-3xl p-6 shadow-2xl`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-xs font-black text-white mb-2">
                {mode.icon} {mode.name}
              </div>
              <h1 className="text-2xl font-black text-white leading-tight truncate">{gameData?.quiz?.title}</h1>
              <p className="text-white/80 text-sm font-semibold mt-1">
                📝 {gameData?.quiz?.questions?.length || 0} questions · waiting for your teacher…
              </p>
            </div>
            <div className="bg-black/30 rounded-2xl px-4 py-3 text-center shrink-0">
              <p className="text-white/60 text-[10px] font-black tracking-widest">ROOM</p>
              <p className="text-2xl font-black text-white tabular-nums">{roomCode}</p>
            </div>
          </div>
        </div>

        {/* My card + team */}
        <div className={`rounded-3xl p-5 border-2 ${myTeam ? '' : 'bg-white/5 border-white/10'}`}
          style={myTeam ? { background: `${myTeam.color}18`, borderColor: `${myTeam.color}88` } : {}}>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img src={playerInfo?.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt="Your avatar"
                className="w-16 h-16 rounded-full border-4 border-amber-400/80 shadow-xl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center text-xs font-black">
                {playerInfo?.avatar?.level || 1}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-black text-white truncate">{playerInfo?.name}</h3>
              {myTeam ? (
                <p className="font-black text-lg" style={{ color: myTeam.color }}>
                  {myTeam.emoji} {myTeam.name}
                </p>
              ) : gameData?.mode === 'team' ? (
                <p className="text-amber-300 text-sm font-semibold animate-pulse">🛡️ Teams being picked…</p>
              ) : (
                <p className="text-emerald-300 text-sm font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block" /> Ready to play!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Power-ups preview */}
        {powerUps.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <h3 className="font-black text-white mb-3">✨ Your Power-ups <span className="text-slate-400 text-sm font-semibold">(one use each!)</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {powerUps.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/10">
                  <span className="text-3xl">{p.icon}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{p.name}</p>
                    <p className="text-slate-400 text-xs">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode explainer */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
          <h3 className="font-black text-white mb-1.5">{mode.icon} How {mode.name} works</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{mode.description}</p>
        </div>

        {/* Reactions */}
        <div className="bg-fuchsia-500/10 border border-fuchsia-400/30 rounded-3xl p-5 text-center">
          <p className="text-fuchsia-200 font-bold mb-3">💜 Send a reaction to the big screen!</p>
          <ReactionBar roomCode={roomCode} playerInfo={playerInfo} />
        </div>

        {/* Player wall */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-white">👥 In the arena <span className="text-fuchsia-300">({players.length})</span></h3>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse inline-block" /> waiting for teacher
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {players.map((player) => {
              const isMe = player.id === playerInfo?.playerId;
              const team = gameData?.mode === 'team' ? getTeamForPlayer(gameData?.teams, player.id) : null;
              return (
                <div key={player.id}
                  className={`rounded-2xl p-2.5 text-center border transition-all ${isMe ? 'bg-amber-500/15 border-amber-400/60 scale-105' : 'bg-white/5 border-white/10'}`}>
                  <img src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt={player.name}
                    className="w-11 h-11 mx-auto rounded-full border-2 mb-1.5"
                    style={{ borderColor: team ? team.color : 'rgba(255,255,255,0.3)' }} />
                  <p className={`text-xs font-bold truncate ${isMe ? 'text-amber-300' : 'text-white'}`}>
                    {isMe ? 'YOU' : player.name}
                  </p>
                  {team && <p className="text-[10px]" style={{ color: team.color }}>{team.emoji}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave */}
        <div className="text-center pt-1">
          <button onClick={onLeaveGame}
            className="bg-white/5 border border-white/10 text-slate-400 px-6 py-2.5 rounded-xl font-semibold hover:bg-rose-500/20 hover:text-rose-300 transition-colors">
            ← Leave Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentLobby;
