// components/quizshow/teacher/GameLobby.js — ARENA LOBBY
// Big-screen friendly: huge room code, animated player wall, team assignment
// for Team Battle, and live emoji reactions floating up the screen.
import React, { useState, useEffect, useRef } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../../../utils/firebase';
import { playQuizSound, GAME_MODES, buildTeamAssignment, getTeamForPlayer } from '../../../utils/quizShowHelpers';
import { ReactionOverlay } from '../shared/Reactions';

const GameLobby = ({ roomCode, gameData, onStartGame, onCancelGame, loading }) => {
  const [players, setPlayers] = useState([]);
  const prevCountRef = useRef(0);
  const [shuffling, setShuffling] = useState(false);

  const mode = GAME_MODES[gameData?.mode] || GAME_MODES.classic;
  const isTeamMode = gameData?.mode === 'team';
  const teams = gameData?.teams || null;
  const teamCount = gameData?.settings?.teamCount || 2;

  useEffect(() => {
    if (gameData?.players) {
      const playerList = Object.entries(gameData.players).map(([id, player]) => ({
        id,
        ...player
      }));
      if (playerList.length > prevCountRef.current) {
        playQuizSound('join');
      }
      prevCountRef.current = playerList.length;
      setPlayers(playerList);
    } else {
      setPlayers([]);
      prevCountRef.current = 0;
    }
  }, [gameData?.players]);

  const shuffleTeams = async () => {
    if (!players.length || shuffling) return;
    setShuffling(true);
    try {
      const assignment = buildTeamAssignment(players.map(p => p.id), teamCount);
      await update(ref(database, `gameRooms/${roomCode}`), { teams: assignment });
      playQuizSound('questionReveal');
    } catch (e) {
      console.error('Team shuffle failed:', e);
    }
    setShuffling(false);
  };

  const teamsAssigned = isTeamMode && teams && players.length > 0 &&
    players.every(p => getTeamForPlayer(teams, p.id));

  const canStartGame = players.length > 0 &&
    gameData?.quiz?.questions?.length > 0 &&
    (!isTeamMode || teamsAssigned);

  const PlayerChip = ({ player }) => {
    const team = isTeamMode ? getTeamForPlayer(teams, player.id) : null;
    return (
      <div
        className="flex items-center gap-3 rounded-2xl bg-white/5 border p-3 transition-all hover:bg-white/10 animate-[qsPop_0.4s_ease-out]"
        style={{ borderColor: team ? `${team.color}88` : 'rgba(255,255,255,0.12)' }}
      >
        <div className="relative shrink-0">
          <img
            src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'}
            alt={`${player.name}'s avatar`}
            className="w-11 h-11 rounded-full border-2 border-white/30"
          />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-fuchsia-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-black">{player.avatar?.level || 1}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate leading-tight">{player.name}</p>
          {team ? (
            <p className="text-xs font-semibold" style={{ color: team.color }}>{team.emoji} {team.name}</p>
          ) : (
            <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" /> Ready
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-3xl bg-slate-950 border border-white/10 overflow-hidden relative">
      <style>{`@keyframes qsPop { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
      <ReactionOverlay reactions={gameData?.reactions} />

      {/* Header */}
      <div className={`relative bg-gradient-to-br ${mode.gradient} px-6 md:px-10 py-8 overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-1.5 text-sm font-bold text-white mb-3">
              {mode.icon} {mode.name} Mode
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow mb-1">{gameData?.quiz?.title}</h1>
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-white/85 text-sm font-semibold mt-2">
              <span>📝 {gameData?.quiz?.questions?.length || 0} questions</span>
              <span>⏱️ ~{gameData?.settings?.timePerQuestion || 20}s each</span>
              {gameData?.settings?.powerUpsEnabled !== false && <span>✨ Power-ups ON</span>}
            </div>
          </div>

          {/* Giant room code */}
          <div className="text-center shrink-0">
            <div className="bg-black/35 backdrop-blur rounded-2xl px-8 py-5 border border-white/25 shadow-2xl">
              <p className="text-white/70 text-xs font-black tracking-[0.3em] uppercase mb-1">Room Code</p>
              <p className="text-5xl md:text-6xl font-black text-white tracking-[0.15em] tabular-nums">{roomCode}</p>
            </div>
            <p className="text-white/80 text-xs mt-2 font-semibold">
              Student portal → Quiz Show tab → enter code
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player wall */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[300px]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-white">
                👥 Players <span className="text-fuchsia-300">({players.length})</span>
              </h2>
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                Waiting for players…
              </div>
            </div>

            {players.length > 0 ? (
              isTeamMode && teams ? (
                // Grouped by team
                <div className="space-y-4">
                  {Object.entries(teams).map(([teamId, team]) => {
                    const members = players.filter(p => team.members?.[p.id]);
                    return (
                      <div key={teamId} className="rounded-2xl border p-4" style={{ borderColor: `${team.color}55`, background: `${team.color}11` }}>
                        <p className="font-black mb-3 flex items-center gap-2" style={{ color: team.color }}>
                          <span className="text-xl">{team.emoji}</span> {team.name}
                          <span className="text-xs text-slate-400 font-semibold">({members.length})</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {members.map(p => <PlayerChip key={p.id} player={p} />)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {players.map((player) => <PlayerChip key={player.id} player={player} />)}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 animate-bounce">📡</div>
                <h3 className="text-xl font-bold text-white mb-2">Waiting for players to join…</h3>
                <p className="text-slate-400 mb-5 text-sm">
                  Share the room code <strong className="text-fuchsia-300 text-base tracking-widest">{roomCode}</strong> with your class
                </p>
                <div className="bg-sky-500/10 border border-sky-400/30 rounded-2xl p-5 max-w-md mx-auto text-left">
                  <h4 className="font-bold text-sky-300 mb-2">📱 How students join</h4>
                  <ol className="text-sky-200/80 text-sm space-y-1">
                    <li>1. Open the <strong>student portal</strong> on any device</li>
                    <li>2. Sign in and open the <strong>Quiz Show</strong> tab</li>
                    <li>3. Enter room code <strong className="tracking-widest">{roomCode}</strong> and join!</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control panel */}
        <div className="space-y-4">
          {/* Team assignment (team mode) */}
          {isTeamMode && (
            <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-5">
              <h3 className="font-black text-amber-200 mb-2">🛡️ Teams</h3>
              {teamsAssigned ? (
                <p className="text-amber-100/80 text-sm mb-3">Teams are set! Shuffle again if you want a new mix.</p>
              ) : (
                <p className="text-amber-100/80 text-sm mb-3">
                  Once everyone's in, shuffle players into <strong>{teamCount} balanced teams</strong>.
                </p>
              )}
              <button
                onClick={shuffleTeams}
                disabled={players.length === 0 || shuffling}
                className="w-full bg-amber-500 text-amber-950 py-3 rounded-xl font-black hover:bg-amber-400 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {shuffling ? 'Shuffling…' : teamsAssigned ? '🔀 Reshuffle Teams' : '🔀 Shuffle into Teams'}
              </button>
            </div>
          )}

          {/* Start */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="font-black text-white mb-4">🎮 Game Controls</h3>
            <button
              onClick={onStartGame}
              disabled={!canStartGame || loading}
              className={`w-full bg-gradient-to-r ${mode.gradient} text-white py-4 px-6 rounded-xl font-black text-lg shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2`}
            >
              🚀 Start the Show
            </button>
            {!canStartGame && (
              <p className="text-sm text-slate-400 text-center mt-3">
                {players.length === 0
                  ? 'Need at least 1 player to start'
                  : isTeamMode && !teamsAssigned
                    ? 'Shuffle players into teams first'
                    : 'Loading quiz data…'}
              </p>
            )}
            <button
              onClick={onCancelGame}
              className="mt-3 w-full bg-white/10 text-slate-300 py-2.5 px-4 rounded-xl font-semibold hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
            >
              ✖ Cancel Game
            </button>
          </div>

          {/* Mode reminder */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="font-black text-white mb-2">{mode.icon} {mode.name}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{mode.description}</p>
          </div>

          {/* Reactions hint */}
          <div className="bg-fuchsia-500/10 border border-fuchsia-400/30 rounded-2xl p-4 text-center">
            <p className="text-fuchsia-200 text-sm font-semibold">
              💜 Students can fire emoji reactions from their devices — watch them float up this screen!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
