// components/quizshow/student/JoinGame.js — STUDENT JOIN SCREEN
// One clean step: your champion card + the room code pad.
import React, { useState, useEffect } from 'react';
import { validateRoomCode, playQuizSound } from '../../../utils/quizShowHelpers';

const JoinGame = ({
  students = [],
  onJoinGame,
  onCancel,
  getAvatarImage,
  calculateAvatarLevel,
  loading
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  // The signed-in student (student portal passes exactly one)
  const me = students[0] || null;
  const level = me ? calculateAvatarLevel(me.totalPoints || 0) : 1;
  const avatarImage = me ? getAvatarImage(me.avatarBase, level) : getAvatarImage('Wizard F', 1);
  const displayName = me ? `${me.firstName} ${me.lastName || ''}`.trim() : 'Player';

  useEffect(() => {
    const input = document.getElementById('roomCodeInput');
    if (input) input.focus();
  }, []);

  const handleRoomCodeChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setRoomCode(cleaned);
    setError('');
  };

  const handleJoin = (e) => {
    e?.preventDefault();
    if (!validateRoomCode(roomCode)) {
      setError('Enter the 6-digit room code from your teacher');
      return;
    }

    const studentInfo = me ? {
      name: displayName,
      studentId: me.id,
      avatar: {
        base: me.avatarBase || 'Wizard F',
        level,
        image: avatarImage
      }
    } : {
      name: 'Player',
      studentId: null,
      avatar: { base: 'Wizard F', level: 1, image: getAvatarImage('Wizard F', 1) }
    };

    playQuizSound('join');
    onJoinGame(roomCode, studentInfo);
  };

  return (
    <div className="min-h-[70vh] rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border border-white/10 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-20 left-1/3 h-56 w-96 rounded-full bg-fuchsia-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-bounce">🎪</div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Join the Quiz Show!</h1>
          <p className="text-slate-400">Type the code on your teacher's screen</p>
        </div>

        {/* Champion card */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <div className="relative shrink-0">
            <img src={avatarImage} alt="Your avatar"
              className="w-16 h-16 rounded-full border-4 border-fuchsia-400/60 shadow-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center text-xs font-black">
              {level}
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-black text-white text-lg truncate">{displayName}</p>
            <p className="text-fuchsia-300 text-sm font-semibold">Level {level} Champion</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-emerald-300 text-xs font-bold shrink-0">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Ready
          </div>
        </div>

        {/* Code entry */}
        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <input
              id="roomCodeInput"
              type="text"
              inputMode="numeric"
              value={roomCode}
              onChange={(e) => handleRoomCodeChange(e.target.value)}
              placeholder="000000"
              className="w-full px-4 py-5 text-4xl text-center font-black bg-white/5 border-2 border-white/15 text-white placeholder-white/15 rounded-2xl focus:border-fuchsia-400 focus:outline-none tracking-[0.4em] tabular-nums"
              maxLength={6}
              autoComplete="off"
            />
            {/* Code progress dots */}
            <div className="flex justify-center gap-2 mt-3">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <span key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < roomCode.length ? 'bg-fuchsia-400 scale-110' : 'bg-white/15'}`} />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-400/40 rounded-xl p-3 text-center">
              <p className="text-rose-300 text-sm font-semibold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || roomCode.length !== 6}
            className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Joining…
              </>
            ) : (
              <>🚀 Join Game</>
            )}
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-6">
          ⚡ Classic · 🛡️ Team Battle · 💀 Sudden Death · 🏁 Quiz Race — your teacher picks the mode!
        </p>
      </div>
    </div>
  );
};

export default JoinGame;
