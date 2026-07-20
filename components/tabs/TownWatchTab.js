// components/tabs/TownWatchTab.js
// ─────────────────────────────────────────────────────────────────────────────
// TOWN WATCH — the teacher's monitoring station for the Town Square
// multiplayer plaza. Live view of who's in town, the chat stream, the
// announcement feed, market stalls and the Wandering Merchant — plus a
// day-by-day archive of every chat message and event (kept even when the
// live chat is cleared), and moderation tools (delete message / clear chat).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useMemo } from 'react';
import { database } from '../../utils/firebase';
import { ref, onValue, off, remove, query, limitToLast } from 'firebase/database';
import { getAvatarImage } from '../../utils/gameHelpers';
import { ITEMS } from '../games/Homestead/homesteadConfig';
import { STALL_TIERS, dayKey } from '../games/TownSquare/townSquareConfig';

const fmtTime = (ts) => {
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
};
const fmtDay = (day) => {
  try { return new Date(`${day}T12:00:00`).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); } catch { return day; }
};

const TownWatchTab = ({ currentClassData, showToast = () => {} }) => {
  const code = (currentClassData?.classCode || '').toLowerCase();
  const [mode, setMode] = useState('live'); // live | history
  const [players, setPlayers] = useState({});
  const [chat, setChat] = useState([]);
  const [events, setEvents] = useState([]);
  const [stalls, setStalls] = useState({});
  const [challenges, setChallenges] = useState({});
  const [shop, setShop] = useState(null);
  const [tally, setTally] = useState({});
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayChat, setDayChat] = useState([]);
  const [dayEvents, setDayEvents] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);

  // ── Live listeners ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!code) return;
    const base = `worldRooms/${code}`;
    const unsubs = [];
    const listen = (path, cb, lim) => {
      const r = lim ? query(ref(database, `${base}/${path}`), limitToLast(lim)) : ref(database, `${base}/${path}`);
      onValue(r, cb);
      unsubs.push(`${base}/${path}`);
    };
    listen('players', (s) => setPlayers(s.val() || {}));
    listen('chat', (s) => {
      const v = s.val() || {};
      setChat(Object.entries(v).map(([id, m]) => ({ id, ...m })).sort((a, b) => (a.at || 0) - (b.at || 0)));
    }, 200);
    listen('events', (s) => {
      const v = s.val() || {};
      setEvents(Object.entries(v).map(([id, m]) => ({ id, ...m })).sort((a, b) => (b.at || 0) - (a.at || 0)));
    }, 50);
    listen('stalls', (s) => setStalls(s.val() || {}));
    listen('challenges', (s) => setChallenges(s.val() || {}));
    listen('shop', (s) => setShop(s.val()));
    listen(`winTally/${dayKey()}`, (s) => setTally(s.val() || {}));
    listen('archiveDays', (s) => setDays(Object.keys(s.val() || {}).sort().reverse()));
    return () => unsubs.forEach((p) => off(ref(database, p)));
  }, [code]);

  // ── History loader ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!code || !selectedDay) return;
    const chatR = ref(database, `worldRooms/${code}/chatArchive/${selectedDay}`);
    const evR = ref(database, `worldRooms/${code}/eventsArchive/${selectedDay}`);
    onValue(chatR, (s) => {
      const v = s.val() || {};
      setDayChat(Object.entries(v).map(([id, m]) => ({ id, ...m })).sort((a, b) => (a.at || 0) - (b.at || 0)));
    });
    onValue(evR, (s) => {
      const v = s.val() || {};
      setDayEvents(Object.entries(v).map(([id, m]) => ({ id, ...m })).sort((a, b) => (a.at || 0) - (b.at || 0)));
    });
    return () => { off(chatR); off(evR); };
  }, [code, selectedDay]);

  // ── Moderation ─────────────────────────────────────────────────────────────
  const deleteLiveMessage = (id) => {
    remove(ref(database, `worldRooms/${code}/chat/${id}`))
      .then(() => showToast('Message removed from the live chat (the archive keeps a record).', 'success'))
      .catch(() => showToast('Could not delete message.', 'error'));
  };
  const clearLiveChat = () => {
    remove(ref(database, `worldRooms/${code}/chat`))
      .then(() => { setConfirmClear(false); showToast('Live chat cleared for all students (archive preserved).', 'success'); })
      .catch(() => showToast('Could not clear chat.', 'error'));
  };

  const activeDuels = useMemo(
    () => Object.values(challenges).filter((c) => c.status === 'active'),
    [challenges]
  );
  const playerList = Object.entries(players);
  const champions = Object.entries(tally).sort((a, b) => (b[1]?.wins || 0) - (a[1]?.wins || 0)).slice(0, 5);

  if (!code) {
    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
        No class code found for this class — the Town Square needs a class code to run.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-rose-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">🏘️ Town Watch</h2>
            <p className="text-amber-100/90 text-sm">Monitor the Town Square — live activity, full chat history, and moderation.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-black/25 rounded-full px-3 py-1 text-sm font-bold">Room: {currentClassData?.classCode}</span>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${playerList.length > 0 ? 'bg-emerald-500/80' : 'bg-black/25'}`}>
              👥 {playerList.length} in town
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => setMode('live')} className={`px-4 py-1.5 rounded-xl text-sm font-bold ${mode === 'live' ? 'bg-white text-amber-800' : 'bg-black/25 hover:bg-black/40'}`}>
            🔴 Live
          </button>
          <button onClick={() => setMode('history')} className={`px-4 py-1.5 rounded-xl text-sm font-bold ${mode === 'history' ? 'bg-white text-amber-800' : 'bg-black/25 hover:bg-black/40'}`}>
            📚 Chat History
          </button>
        </div>
      </div>

      {mode === 'live' ? (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Live chat + moderation */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow border border-gray-200 flex flex-col" style={{ minHeight: 420 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">💬 Live Chat</h3>
              {confirmClear ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-rose-600 font-semibold">Clear chat for everyone?</span>
                  <button onClick={clearLiveChat} className="bg-rose-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Yes, clear</button>
                  <button onClick={() => setConfirmClear(false)} className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmClear(true)} className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg">
                  Clear Live Chat
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5" style={{ maxHeight: 420 }}>
              {chat.length === 0 && <p className="text-gray-400 text-sm text-center py-10">No messages in the live chat.</p>}
              {chat.map((m) => (
                <div key={m.id} className="group flex items-start gap-2 text-sm hover:bg-gray-50 rounded-lg px-2 py-1">
                  <span className="text-gray-400 text-xs mt-0.5 w-12 shrink-0">{fmtTime(m.at)}</span>
                  <span className="font-bold text-amber-700 shrink-0">{m.name}:</span>
                  <span className="text-gray-700 flex-1 break-words">{m.text}</span>
                  <button onClick={() => deleteLiveMessage(m.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 text-xs font-bold shrink-0" title="Remove from live chat">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Side column: who's in town, duels, champions, shop, announcements, stalls */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-2">👥 In Town Now</h3>
              {playerList.length === 0 && <p className="text-gray-400 text-xs">The square is empty.</p>}
              <div className="flex flex-wrap gap-2">
                {playerList.map(([id, p]) => (
                  <div key={id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full pl-1 pr-2.5 py-0.5">
                    <img src={getAvatarImage(p.avatarBase, p.level)} alt="" className="w-6 h-6 rounded-full border" style={{ borderColor: p.ring || '#ddd' }} />
                    <span className="text-xs font-semibold text-gray-700">{p.name}</span>
                  </div>
                ))}
              </div>
              {activeDuels.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-1">⚔️ Active duels</p>
                  {activeDuels.map((c, i) => (
                    <p key={i} className="text-xs text-gray-600">{c.from?.name} vs {c.to?.name} — {c.game}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-2">🏆 Today&apos;s Champions</h3>
              {champions.length === 0 && <p className="text-gray-400 text-xs">No duel wins yet today.</p>}
              {champions.map(([pid, t], i) => (
                <div key={pid} className="flex items-center gap-2 text-sm py-0.5">
                  <span className="w-6 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                  <span className="flex-1 font-semibold text-gray-700 truncate">{t?.name}</span>
                  <span className="text-amber-600 font-bold text-xs">{t?.wins} wins</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-2">🎪 Wandering Merchant</h3>
              {!shop ? <p className="text-gray-400 text-xs">Shop not set up yet (opens when a student first visits).</p> : (
                <>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {Object.entries(shop.stock || {}).map(([sid, s]) => (
                      <div key={sid} className={`rounded-lg border p-1.5 text-center ${(s?.qty || 0) <= 0 ? 'border-gray-100 opacity-40' : 'border-gray-200'}`} title={`${ITEMS[s.itemId]?.name} — ${s.qty} left @ ${s.price}g`}>
                        {ITEMS[s.itemId]?.img && <img src={ITEMS[s.itemId].img} alt="" className="w-6 h-6 mx-auto object-contain" style={ITEMS[s.itemId].tint ? { filter: ITEMS[s.itemId].tint } : undefined} />}
                        <p className="text-[9px] text-gray-500 font-bold">{s.qty}×</p>
                      </div>
                    ))}
                  </div>
                  {shop.task && (
                    <p className="text-xs text-gray-600">
                      Restock task: <b>{shop.task.have || 0}/{shop.task.need}</b> {ITEMS[shop.task.itemId]?.name} donated
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-2">📣 Recent Announcements</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {events.length === 0 && <p className="text-gray-400 text-xs">Nothing announced yet.</p>}
                {events.map((e) => (
                  <p key={e.id} className="text-xs text-gray-600"><span className="text-gray-400">{fmtTime(e.at)}</span> {e.text}</p>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-2">🏪 Market Stalls ({Object.keys(stalls).length})</h3>
              {Object.keys(stalls).length === 0 && <p className="text-gray-400 text-xs">No stalls built yet.</p>}
              {Object.values(stalls).map((s, i) => (
                <div key={i} className="text-xs text-gray-600 py-0.5">
                  <b>{s.ownerName}</b> — {STALL_TIERS[(s.tier || 1) - 1]?.name} · {Object.keys(s.listings || {}).length} items listed
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── HISTORY MODE ── */
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-2">📅 Days on Record</h3>
            {days.length === 0 && <p className="text-gray-400 text-xs">No archived days yet — the archive starts the first time students chat.</p>}
            <div className="space-y-1">
              {days.map((d) => (
                <button key={d} onClick={() => setSelectedDay(d)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${selectedDay === d ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-50 text-gray-600'}`}>
                  {fmtDay(d)} {d === dayKey() && <span className="text-[10px] text-emerald-600 font-bold">TODAY</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 bg-white rounded-2xl shadow border border-gray-200 p-4">
            {!selectedDay ? (
              <p className="text-gray-400 text-sm text-center py-16">Pick a day to review its full chat log and events.</p>
            ) : (
              <>
                <h3 className="font-bold text-gray-800 mb-3">📜 {fmtDay(selectedDay)} — {dayChat.length} messages · {dayEvents.length} events</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1.5">Chat log (permanent record)</p>
                    <div className="space-y-1 max-h-[420px] overflow-y-auto border border-gray-100 rounded-xl p-3">
                      {dayChat.length === 0 && <p className="text-gray-400 text-xs">No chat this day.</p>}
                      {dayChat.map((m) => (
                        <div key={m.id} className="text-sm">
                          <span className="text-gray-400 text-xs">{fmtTime(m.at)}</span>{' '}
                          <span className="font-bold text-amber-700">{m.name}:</span>{' '}
                          <span className="text-gray-700 break-words">{m.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1.5">Announcements & activity</p>
                    <div className="space-y-1 max-h-[420px] overflow-y-auto border border-gray-100 rounded-xl p-3">
                      {dayEvents.length === 0 && <p className="text-gray-400 text-xs">No events this day.</p>}
                      {dayEvents.map((e) => (
                        <p key={e.id} className="text-xs text-gray-600"><span className="text-gray-400">{fmtTime(e.at)}</span> {e.text}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TownWatchTab;
