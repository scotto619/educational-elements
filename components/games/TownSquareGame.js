// components/games/TownSquareGame.js
// ─────────────────────────────────────────────────────────────────────────────
// TOWN SQUARE — the live multiplayer plaza connecting Wildwood Homestead,
// Champions Menagerie and Champions Forge. Students walk around as their real
// avatar, see and chat with classmates in real time, build market stalls out
// of genuine Wildwood resources to buy/sell/trade spare items, and challenge
// each other to quick head-to-head minigames.
//
// Realtime state (position, chat, live stall stock, challenges) lives in the
// Realtime Database under worldRooms/{classCode} — same pattern already used
// by MultiplayerAgarGame.js. Durable data (stall ownership + Wildwood
// inventory/gold) is saved to Firestore via updateStudentData exactly like
// WildwoodHomesteadGame.js: this game owns studentData.townSquareData, and
// only ever touches the existing `inv`/`gold` fields of studentData.homesteadData
// (never adding new keys there), so Wildwood's own save code stays untouched.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { database } from '../../utils/firebase';
import {
  ref, set, update, remove, push, off, onValue, onChildAdded, onChildChanged,
  onChildRemoved, onDisconnect, runTransaction, query, limitToLast,
} from 'firebase/database';
import { getAvatarImage, calculateAvatarLevel } from '../../utils/gameHelpers';
import { containsProfanity } from '../../utils/profanityFilter';
import { ITEMS, GOLD_ICON, fmtQty, prosperityOf } from './Homestead/homesteadConfig';
import { forgeStageFor } from './SweetEmpire/sweetEmpireConfig';
import { SPECIES_MAP as MENAGERIE_SPECIES } from './Menagerie/menagerieConfig';
import {
  PLOTS, STALL_TIERS, STALL_THEMES, MINIGAMES, MINIGAME_MAP, ringColorFor,
  canAfford, deductCost, fmtCost, DECOR, NETWORK_RATE, CHAT_BUBBLE_MS,
  INTERACT_RADIUS, WORLD_W, WORLD_H, MARGIN, MOVE_SPEED, CAMERA_LERP, EMPTY_PLOT_IMG,
  MERCHANT, MERCHANT_IMG, SHOP_SLOTS, rollShopStock, rollRestockTask, dayKey,
  EMOTES, EVENT_BANNER_MS,
  FOUNTAIN, FOUNTAIN_IMG, WISH_COST, WISHES_PER_DAY, rollWish,
  RACE_START, RACE_CHECKPOINTS, RACE_RADIUS, RACE_FLAG_IMG,
  NOTICEBOARD, NOTICEBOARD_IMG, questsForDay,
  TREASURE_CROSS_IMG, TREASURE_MAP_IMG, TREASURE_RADIUS, TREASURE_REWARD, treasureSpot, treasureHint,
} from './TownSquare/townSquareConfig';
import ChallengeOverlay from './TownSquare/MiniGames';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const dist = (a, b) => Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0));

const cloneHomestead = (h) => ({
  ...(h || {}),
  inv: { ...((h && h.inv) || {}) },
  gold: Math.floor(Number(h?.gold) || 0),
});
const cloneTownSquare = (t) => ({
  ...(t || {}),
  stall: t?.stall ? { ...t.stall, listings: { ...(t.stall.listings || {}) } } : null,
});

const themeColor = (id) => STALL_THEMES.find((t) => t.id === id)?.color || '#a16207';

const TownSquareGame = ({ studentData, updateStudentData, showToast, classData, classmates = [], onSwitchGame = null }) => {
  const [screen, setScreen] = useState('menu'); // menu | playing
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [remotePlayers, setRemotePlayers] = useState({});
  const [stalls, setStalls] = useState({});
  const [challenges, setChallenges] = useState({});
  const [chatLog, setChatLog] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [myBubble, setMyBubble] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [shopState, setShopState] = useState(null);      // Wandering Merchant (class-shared)
  const [banner, setBanner] = useState(null);            // current announcement banner
  const [tally, setTally] = useState({});                // today's win tally
  const [championsOpen, setChampionsOpen] = useState(false);
  const [emoteOpen, setEmoteOpen] = useState(false);
  const [myEmote, setMyEmote] = useState(null);
  const [raceBoard, setRaceBoard] = useState({});
  const [wishResult, setWishResult] = useState(null);
  const [treasureVisible, setTreasureVisible] = useState(false);
  const bannerQueueRef = useRef([]);
  const companionDivRef = useRef(null);
  const companionPosRef = useRef({ x: 0, y: 0 });
  const raceRef = useRef({ stage: -1, startedAt: 0 }); // -1 idle, 0..2 = next checkpoint, 3 = heading home
  const [, forceTick] = useState(0); // cheap re-render pulse for bubble expiry / gold display

  const containerRef = useRef(null);
  const worldDivRef = useRef(null);
  const avatarDivRef = useRef(null);
  const myPosRef = useRef({ x: WORLD_W / 2, y: WORLD_H / 2 });
  const cameraRef = useRef({ x: 0, y: 0 });
  const viewportSizeRef = useRef({ w: 900, h: 600 });
  const keysRef = useRef({ up: false, down: false, left: false, right: false });
  const remotePlayersStoreRef = useRef({});
  const challengesRef = useRef({});
  const joinedAtRef = useRef(0); // messages sent before this timestamp are old history — hide them for a freshly-joined student
  const localHomesteadRef = useRef(cloneHomestead(studentData?.homesteadData));
  const localTownSquareRef = useRef(cloneTownSquare(studentData?.townSquareData));
  const myIdRef = useRef(studentData?.id || `anon_${Date.now()}`);
  const roomCodeRef = useRef(null);
  const myPlayerDbRef = useRef(null);
  const animFrameRef = useRef(null);
  const networkIntervalRef = useRef(null);
  const flushIntervalRef = useRef(null);
  const chatEndRef = useRef(null);

  const myLevel = calculateAvatarLevel(studentData?.totalPoints || 0);
  const myName = studentData?.firstName || 'Student';
  const myAvatarSrc = getAvatarImage(studentData?.avatarBase || 'Wizard F', myLevel);

  const getMeInfo = useCallback(() => {
    // Cross-game flair, published so everyone can see it on my player card:
    // my Forge weapon, my Wildwood prosperity, and my Menagerie companion.
    const stage = studentData?.sweetEmpireData ? forgeStageFor(studentData.sweetEmpireData) : null;
    const md = studentData?.menagerieData;
    const comp = md?.companionUid ? (md.creatures || []).find((c) => c.uid === md.companionUid) : null;
    const compSpecies = comp ? MENAGERIE_SPECIES[comp.speciesId] : null;
    return {
      id: myIdRef.current,
      name: myName,
      avatarBase: studentData?.avatarBase || 'Wizard F',
      level: myLevel,
      ring: ringColorFor(myIdRef.current),
      weaponName: stage && stage.index > 0 ? stage.name : null,
      weaponImg: stage && stage.index > 0 ? stage.img : null,
      prosperity: prosperityOf(studentData?.homesteadData) || 0,
      companion: compSpecies ? { img: compSpecies.img, name: compSpecies.name, shiny: !!comp.shiny } : null,
    };
  }, [myName, studentData, myLevel]);

  // ── Save helpers (local-authoritative, mirroring WildwoodHomesteadGame) ────
  const saveHomestead = useCallback(() => updateStudentData({ homesteadData: localHomesteadRef.current }).catch(() => {}), [updateStudentData]);
  const saveBoth = useCallback(() => updateStudentData({
    homesteadData: localHomesteadRef.current,
    townSquareData: localTownSquareRef.current,
  }).catch(() => {}), [updateStudentData]);

  const syncStallToRTDB = useCallback((stallObj) => {
    if (!roomCodeRef.current) return;
    const me = getMeInfo();
    if (!stallObj) {
      remove(ref(database, `worldRooms/${roomCodeRef.current}/stalls/${myIdRef.current}`)).catch(() => {});
      return;
    }
    set(ref(database, `worldRooms/${roomCodeRef.current}/stalls/${myIdRef.current}`), {
      ownerId: me.id, ownerName: me.name, avatarBase: me.avatarBase, level: me.level,
      plotId: stallObj.plotId, tier: stallObj.tier, theme: stallObj.theme || 'gold',
      listings: stallObj.listings || {}, updatedAt: Date.now(),
    }).catch(() => {});
  }, [getMeInfo]);

  // ═══════════════════════════════════════════════════════════════════════
  // JOIN / LEAVE
  // ═══════════════════════════════════════════════════════════════════════
  const setupListeners = useCallback((code, myId) => {
    const playersPath = ref(database, `worldRooms/${code}/players`);
    onChildAdded(playersPath, (snap) => {
      if (snap.key === myId) return;
      remotePlayersStoreRef.current[snap.key] = snap.val();
      // Fresh arrivals (after our own join settles) get a friendly notice
      if (Date.now() - joinedAtRef.current > 2500) {
        const nm = snap.val()?.name || 'Someone';
        setChatLog((prev) => [...prev.slice(-49), { id: `j_${snap.key}_${Date.now()}`, sys: true, text: `🚪 ${nm} wandered into town`, at: Date.now() }]);
      }
    });
    onChildChanged(playersPath, (snap) => {
      if (snap.key === myId) return;
      remotePlayersStoreRef.current[snap.key] = { ...remotePlayersStoreRef.current[snap.key], ...snap.val() };
    });
    onChildRemoved(playersPath, (snap) => {
      const nm = remotePlayersStoreRef.current[snap.key]?.name;
      delete remotePlayersStoreRef.current[snap.key];
      if (nm && Date.now() - joinedAtRef.current > 2500) {
        setChatLog((prev) => [...prev.slice(-49), { id: `l_${snap.key}_${Date.now()}`, sys: true, text: `👋 ${nm} left town`, at: Date.now() }]);
      }
    });

    // Town-wide announcements (victories, trades, restocks)
    const eventsQ = query(ref(database, `worldRooms/${code}/events`), limitToLast(10));
    onChildAdded(eventsQ, (snap) => {
      const evt = snap.val();
      if (!evt) return;
      setChatLog((prev) => [...prev.slice(-49), { id: `e_${snap.key}`, sys: true, text: evt.text, at: evt.at }]);
      if ((evt.at || 0) >= joinedAtRef.current) {
        bannerQueueRef.current = [...bannerQueueRef.current.slice(-4), { id: snap.key, text: evt.text, type: evt.type }];
      }
    });

    // The Wandering Merchant (shared shop)
    onValue(ref(database, `worldRooms/${code}/shop`), (snap) => setShopState(snap.val()));

    // Today's win tally
    onValue(ref(database, `worldRooms/${code}/winTally/${dayKey()}`), (snap) => setTally(snap.val() || {}));

    // Today's fastest plaza laps
    onValue(ref(database, `worldRooms/${code}/plazaRace/${dayKey()}`), (snap) => setRaceBoard(snap.val() || {}));

    const stallsPath = ref(database, `worldRooms/${code}/stalls`);
    onValue(stallsPath, (snap) => {
      const data = snap.val() || {};
      setStalls(data);

      // Reconcile MY OWN stall's stock from the live RTDB copy. Buyers only
      // ever decrement `listings/{itemId}/qty` directly in RTDB (they can't
      // write to my Firestore doc) — if I never pull that decrement back
      // into my local authoritative copy, my next stall save (restocking,
      // taking an item back, changing the theme, upgrading…) would push my
      // stale, pre-sale quantity back over the top and "un-sell" the item,
      // letting it be taken back or re-sold. This keeps qty always in sync.
      const myRtdbStall = data[myId];
      const myStall = localTownSquareRef.current.stall;
      if (myRtdbStall?.listings && myStall?.listings) {
        let changed = false;
        Object.entries(myRtdbStall.listings).forEach(([itemId, live]) => {
          const localListing = myStall.listings[itemId];
          if (localListing && typeof live?.qty === 'number' && live.qty !== localListing.qty) {
            localListing.qty = Math.max(0, live.qty);
            changed = true;
          }
        });
        if (changed) {
          forceTick((n) => n + 1);
          updateStudentData({ townSquareData: localTownSquareRef.current }).catch(() => {});
        }
      }
    });

    const challengesPath = ref(database, `worldRooms/${code}/challenges`);
    onValue(challengesPath, (snap) => {
      const val = snap.val() || {};
      challengesRef.current = val;
      setChallenges(val);
    });

    const chatQ = query(ref(database, `worldRooms/${code}/chat`), limitToLast(30));
    onChildAdded(chatQ, (snap) => {
      const msg = snap.val();
      if (!msg) return;
      if ((msg.at || 0) < joinedAtRef.current) return; // old history from before I joined — skip it
      setChatLog((prev) => [...prev.slice(-49), { id: snap.key, ...msg }]);
      const bubble = { text: msg.text, expiresAt: Date.now() + CHAT_BUBBLE_MS };
      if (msg.pid === myId) setMyBubble(bubble);
      else remotePlayersStoreRef.current[msg.pid] = { ...(remotePlayersStoreRef.current[msg.pid] || {}), bubble };
    });

    const pendingPath = ref(database, `worldRooms/${code}/pendingIncome/${myId}`);
    onChildAdded(pendingPath, (snap) => claimPendingIncome(code, snap.key, snap.val()));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reveal the buried treasure only when you wander close to it
  useEffect(() => {
    if (screen !== 'playing' || !todaysTreasure) return;
    const t = setInterval(() => {
      if (treasureFound()) { setTreasureVisible(false); return; }
      const near = dist(myPosRef.current, todaysTreasure) <= TREASURE_RADIUS;
      setTreasureVisible((v) => (v === near ? v : near));
    }, 400);
    return () => clearInterval(t);
  }, [screen, todaysTreasure]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rotate the announcement banner queue
  useEffect(() => {
    if (screen !== 'playing') return;
    const t = setInterval(() => {
      setBanner((cur) => {
        if (cur && Date.now() - cur.shownAt < EVENT_BANNER_MS) return cur;
        const next = bannerQueueRef.current.shift();
        return next ? { ...next, shownAt: Date.now() } : null;
      });
    }, 500);
    return () => clearInterval(t);
  }, [screen]);

  // Push a town-wide announcement (live feed + teacher archive)
  const pushEvent = useCallback((text, type = 'info') => {
    const code = roomCodeRef.current;
    if (!code) return;
    const day = dayKey();
    const evt = { type, text, at: Date.now() };
    push(ref(database, `worldRooms/${code}/events`), evt).catch(() => {});
    push(ref(database, `worldRooms/${code}/eventsArchive/${day}`), evt).catch(() => {});
    set(ref(database, `worldRooms/${code}/archiveDays/${day}`), true).catch(() => {});
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // WANDERING MERCHANT (class-shared shop with co-op restock challenges)
  // ═══════════════════════════════════════════════════════════════════════
  const ensureShop = useCallback((code) => {
    runTransaction(ref(database, `worldRooms/${code}/shop`), (cur) => {
      if (cur) return undefined; // already exists — abort
      return { gen: 1, stock: rollShopStock(), task: rollRestockTask() };
    }).catch(() => {});
  }, []);

  const buyShopItem = useCallback(async (slotId) => {
    const slot = shopState?.stock?.[slotId];
    if (!slot || slot.qty <= 0) { showToast?.('Sold out! Help restock the caravan.', 'error'); return; }
    if (!isNear(MERCHANT)) { showToast?.('Walk closer to the caravan first!', 'error'); return; }
    if ((localHomesteadRef.current.gold || 0) < slot.price) { showToast?.('Not enough gold!', 'error'); return; }
    try {
      const res = await runTransaction(ref(database, `worldRooms/${roomCodeRef.current}/shop/stock/${slotId}/qty`), (cur) => {
        if (typeof cur !== 'number' || cur <= 0) return;
        return cur - 1;
      });
      if (!res.committed) { showToast?.('Sold out!', 'error'); return; }
      localHomesteadRef.current.gold -= slot.price;
      localHomesteadRef.current.inv[slot.itemId] = (localHomesteadRef.current.inv[slot.itemId] || 0) + 1;
      saveHomestead();
      bumpDaily('buys');
      showToast?.(`Bought ${ITEMS[slot.itemId]?.name} for ${slot.price} gold!`, 'success');
      if (slot.price >= 60) pushEvent(`💎 ${myName} snagged a ${ITEMS[slot.itemId]?.name} from the Wandering Merchant!`, 'shop');
      forceTick((n) => n + 1);
    } catch {
      showToast?.('Purchase failed — try again.', 'error');
    }
  }, [shopState, myName, saveHomestead, showToast, pushEvent]);

  const donateToShop = useCallback(async () => {
    const task = shopState?.task;
    if (!task) return;
    if (!isNear(MERCHANT)) { showToast?.('Walk closer to the caravan first!', 'error'); return; }
    if ((localHomesteadRef.current.inv[task.itemId] || 0) < 1) {
      showToast?.(`The merchant needs ${ITEMS[task.itemId]?.name} — gather some in Wildwood!`, 'error');
      return;
    }
    try {
      const res = await runTransaction(ref(database, `worldRooms/${roomCodeRef.current}/shop/task/have`), (cur) => {
        if (typeof cur !== 'number') return;
        if (cur >= task.need) return;
        return cur + 1;
      });
      if (!res.committed) { showToast?.('The task is already complete!', 'info'); return; }
      localHomesteadRef.current.inv[task.itemId] -= 1;
      if (localHomesteadRef.current.inv[task.itemId] <= 0) delete localHomesteadRef.current.inv[task.itemId];
      saveHomestead();
      bumpDaily('donates');
      showToast?.(`Donated 1 ${ITEMS[task.itemId]?.name} — thank you!`, 'success');
      forceTick((n) => n + 1);
      // If that donation completed the task, exactly one client rerolls the shop
      if (res.snapshot.val() >= task.need) {
        const restock = await runTransaction(ref(database, `worldRooms/${roomCodeRef.current}/shop`), (cur) => {
          if (!cur || !cur.task || (cur.task.have || 0) < (cur.task.need || 1)) return;
          return { gen: (cur.gen || 0) + 1, stock: rollShopStock(), task: rollRestockTask() };
        });
        if (restock.committed) pushEvent('🎪 The class restocked the Wandering Merchant — fresh goods have arrived!', 'shop');
      }
    } catch {
      showToast?.('Donation failed — try again.', 'error');
    }
  }, [shopState, saveHomestead, showToast, pushEvent]);

  // ── Plaza race finish (ref-called from the flush interval) ─────────────────
  const finishRaceRef = useRef(null);
  finishRaceRef.current = (ms) => {
    const secs = (ms / 1000).toFixed(1);
    const code = roomCodeRef.current;
    const day = dayKey();
    const myBest = raceBoard[myIdRef.current]?.ms;
    const overallBest = Object.values(raceBoard).reduce((m, r) => Math.min(m, r?.ms ?? Infinity), Infinity);
    showToast?.(`🏁 Lap complete: ${secs}s!${myBest && ms >= myBest ? ` (your best: ${(myBest / 1000).toFixed(1)}s)` : ''}`, 'success');
    bumpDaily('laps');
    if (!myBest || ms < myBest) {
      set(ref(database, `worldRooms/${code}/plazaRace/${day}/${myIdRef.current}`), { name: myName, ms, at: Date.now() }).catch(() => {});
      if (ms < overallBest) pushEvent(`🏁 ${myName} set today's fastest plaza lap: ${secs}s!`, 'race');
    }
  };

  // ── Daily activity stats (feed the Quest Board) ─────────────────────────────
  const dailyStats = () => {
    const d = localTownSquareRef.current.daily;
    return d && d.day === dayKey() ? d : { day: dayKey(), laps: 0, buys: 0, donates: 0, emotes: 0, chats: 0 };
  };
  const bumpDaily = (stat, n = 1) => {
    const d = { ...dailyStats() };
    d[stat] = (d[stat] || 0) + n;
    localTownSquareRef.current.daily = d;
    dirtyRef.current = true;
  };
  // Progress for a quest stat, from whichever system tracks it
  const questProgress = (q) => {
    if (q.stat === 'duelWins') return tally[myIdRef.current]?.wins || 0;
    if (q.stat === 'wishes') return wishesToday();
    return dailyStats()[q.stat] || 0;
  };
  const questClaims = () => {
    const c = localTownSquareRef.current.questClaims;
    return c && c.day === dayKey() ? (c.ids || []) : [];
  };
  const claimQuest = useCallback((q) => {
    if (questClaims().includes(q.id)) return;
    if (questProgress(q) < q.need) { showToast?.('Not done yet — check the progress bar!', 'error'); return; }
    localTownSquareRef.current.questClaims = { day: dayKey(), ids: [...questClaims(), q.id] };
    localHomesteadRef.current.gold = (localHomesteadRef.current.gold || 0) + q.reward;
    saveBoth();
    showToast?.(`Quest complete: ${q.name} — +${q.reward} gold!`, 'success');
    forceTick((n) => n + 1);
  }, [saveBoth, showToast, tally]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Daily treasure hunt ─────────────────────────────────────────────────────
  const todaysTreasure = useMemo(
    () => (roomCodeRef.current || classData?.classCode ? treasureSpot(dayKey(), (classData?.classCode || '').toLowerCase()) : null),
    [classData?.classCode]
  );
  const treasureFound = () => {
    const t = localTownSquareRef.current.treasure;
    return !!(t && t.day === dayKey() && t.found);
  };
  const claimTreasure = useCallback(() => {
    if (treasureFound() || !todaysTreasure) return;
    if (dist(myPosRef.current, todaysTreasure) > TREASURE_RADIUS + 40) return;
    localTownSquareRef.current.treasure = { day: dayKey(), found: true };
    localHomesteadRef.current.gold = (localHomesteadRef.current.gold || 0) + TREASURE_REWARD.gold;
    localHomesteadRef.current.menagerieEssenceEarned = (localHomesteadRef.current.menagerieEssenceEarned || 0) + TREASURE_REWARD.essence;
    saveBoth();
    setTreasureVisible(false);
    showToast?.(`🗺️ TREASURE! +${TREASURE_REWARD.gold} gold and +${TREASURE_REWARD.essence} Wild Essence for your Menagerie!`, 'success');
    pushEvent(`🗺️ ${myName} dug up today's buried treasure!`, 'treasure');
    forceTick((n) => n + 1);
  }, [todaysTreasure, saveBoth, showToast, pushEvent, myName]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── The Wishing Fountain ────────────────────────────────────────────────────
  const wishesToday = () => {
    const w = localTownSquareRef.current.wishes;
    return w && w.day === dayKey() ? (w.count || 0) : 0;
  };

  const tossCoin = useCallback(() => {
    if (!isNear(FOUNTAIN)) { showToast?.('Walk closer to the fountain first!', 'error'); return; }
    if (wishesToday() >= WISHES_PER_DAY) { showToast?.('The fountain is done granting wishes today — come back tomorrow!', 'info'); return; }
    if ((localHomesteadRef.current.gold || 0) < WISH_COST) { showToast?.(`You need ${WISH_COST} gold to toss a coin!`, 'error'); return; }
    localHomesteadRef.current.gold -= WISH_COST;
    localTownSquareRef.current.wishes = { day: dayKey(), count: wishesToday() + 1 };
    const wish = rollWish();
    if (wish.type === 'jackpot') {
      localHomesteadRef.current.gold += wish.gold;
      pushEvent(`⛲ ${myName} hit the FOUNTAIN JACKPOT — ${wish.gold} gold!`, 'wish');
    } else if (wish.type === 'gold') {
      localHomesteadRef.current.gold += wish.gold;
    } else if (wish.type === 'essence') {
      localHomesteadRef.current.menagerieEssenceEarned = (localHomesteadRef.current.menagerieEssenceEarned || 0) + wish.essence;
    } else if (wish.type === 'scroll') {
      localHomesteadRef.current.unreadScrolls = (localHomesteadRef.current.unreadScrolls || 0) + 1;
      pushEvent(`⛲ ${myName} fished a Recipe Scroll out of the fountain!`, 'wish');
    }
    saveBoth();
    setWishResult(wish);
    forceTick((n) => n + 1);
  }, [myName, saveBoth, showToast, pushEvent, raceBoard]); // eslint-disable-line react-hooks/exhaustive-deps

  // Quick emotes — visible above your head to everyone nearby
  const sendEmote = useCallback((e) => {
    setEmoteOpen(false);
    const stamp = { e, at: Date.now() };
    setMyEmote(stamp);
    bumpDaily('emotes');
    if (myPlayerDbRef.current) update(myPlayerDbRef.current, { emote: stamp }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const claimPendingIncome = useCallback((code, saleId, sale) => {
    if (!sale) return;
    localHomesteadRef.current.gold = (localHomesteadRef.current.gold || 0) + (sale.price || 0);
    saveHomestead();
    showToast?.(`Sold ${ITEMS[sale.itemId]?.name || sale.itemId} to ${sale.buyerName || 'a classmate'} for ${sale.price} gold! 💰`, 'success');
    remove(ref(database, `worldRooms/${code}/pendingIncome/${myIdRef.current}/${saleId}`)).catch(() => {});
  }, [saveHomestead, showToast]);

  const loop = useCallback(() => {
    const k = keysRef.current;
    let dx = 0, dy = 0;
    if (k.up) dy -= 1;
    if (k.down) dy += 1;
    if (k.left) dx -= 1;
    if (k.right) dx += 1;
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      const p = myPosRef.current;
      const nx = clamp(p.x + (dx / len) * MOVE_SPEED, MARGIN, WORLD_W - MARGIN);
      const ny = clamp(p.y + (dy / len) * MOVE_SPEED, MARGIN, WORLD_H - MARGIN);
      myPosRef.current = { x: nx, y: ny };
      if (avatarDivRef.current) {
        avatarDivRef.current.style.left = `${nx}px`;
        avatarDivRef.current.style.top = `${ny}px`;
      }
    }

    // My Menagerie companion trots along behind me (lagged follow)
    if (companionDivRef.current) {
      const target = { x: myPosRef.current.x - 30, y: myPosRef.current.y + 12 };
      const cp = companionPosRef.current;
      cp.x += (target.x - cp.x) * 0.08;
      cp.y += (target.y - cp.y) * 0.08;
      companionDivRef.current.style.left = `${cp.x}px`;
      companionDivRef.current.style.top = `${cp.y}px`;
    }

    // Camera smoothly follows the local player, clamped so we never scroll
    // past the edges of the world (or beyond its extent, on tiny worlds).
    const vp = viewportSizeRef.current;
    const p = myPosRef.current;
    const maxCamX = Math.max(0, WORLD_W - vp.w);
    const maxCamY = Math.max(0, WORLD_H - vp.h);
    const targetCamX = clamp(p.x - vp.w / 2, 0, maxCamX);
    const targetCamY = clamp(p.y - vp.h / 2, 0, maxCamY);
    const cam = cameraRef.current;
    cam.x += (targetCamX - cam.x) * CAMERA_LERP;
    cam.y += (targetCamY - cam.y) * CAMERA_LERP;
    if (worldDivRef.current) {
      worldDivRef.current.style.transform = `translate3d(${-cam.x}px, ${-cam.y}px, 0)`;
    }

    animFrameRef.current = requestAnimationFrame(loop);
  }, []);

  const joinTownSquare = useCallback(() => {
    if (!classData?.classCode) { showToast?.('Class code not found!', 'error'); return; }
    const code = classData.classCode.toLowerCase();
    roomCodeRef.current = code;
    const myId = studentData?.id || `anon_${Date.now()}`;
    myIdRef.current = myId;
    joinedAtRef.current = Date.now();

    localHomesteadRef.current = cloneHomestead(studentData?.homesteadData);
    localTownSquareRef.current = cloneTownSquare(studentData?.townSquareData);

    const spawn = { x: WORLD_W / 2 + (Math.random() - 0.5) * 200, y: WORLD_H * 0.58 + (Math.random() - 0.5) * 140 };
    myPosRef.current = spawn;
    cameraRef.current = {
      x: clamp(spawn.x - viewportSizeRef.current.w / 2, 0, Math.max(0, WORLD_W - viewportSizeRef.current.w)),
      y: clamp(spawn.y - viewportSizeRef.current.h / 2, 0, Math.max(0, WORLD_H - viewportSizeRef.current.h)),
    };

    const me = getMeInfo();
    const playerRef = ref(database, `worldRooms/${code}/players/${myId}`);
    myPlayerDbRef.current = playerRef;
    set(playerRef, { ...me, x: spawn.x, y: spawn.y, updatedAt: Date.now() }).catch(() => {});
    onDisconnect(playerRef).remove();

    remotePlayersStoreRef.current = {};
    setRemotePlayers({});
    setChatLog([]);
    bannerQueueRef.current = [];
    setBanner(null);
    setupListeners(code, myId);
    ensureShop(code);

    if (localTownSquareRef.current.stall) syncStallToRTDB(localTownSquareRef.current.stall);

    networkIntervalRef.current = setInterval(() => {
      if (!myPlayerDbRef.current) return;
      update(myPlayerDbRef.current, { x: Math.round(myPosRef.current.x), y: Math.round(myPosRef.current.y), updatedAt: Date.now() }).catch(() => {});
    }, NETWORK_RATE);

    flushIntervalRef.current = setInterval(() => {
      setRemotePlayers({ ...remotePlayersStoreRef.current });
      forceTick((n) => n + 1);

      // ── Plaza race progression (touch the flags in order) ────────────────
      const race = raceRef.current;
      const p = myPosRef.current;
      const touching = (t) => Math.hypot(p.x - t.x, p.y - t.y) <= RACE_RADIUS;
      if (race.stage === -1) {
        if (touching(RACE_START)) {
          raceRef.current = { stage: 0, startedAt: Date.now() };
          showToast?.('🏁 GO! Round flags 1 → 2 → 3 and back to the start line!', 'success');
        }
      } else if (race.stage < RACE_CHECKPOINTS.length) {
        if (touching(RACE_CHECKPOINTS[race.stage])) {
          raceRef.current = { ...race, stage: race.stage + 1 };
          showToast?.(`🚩 Flag ${race.stage + 1}!`, 'info');
        }
      } else if (touching(RACE_START)) {
        const ms = Date.now() - race.startedAt;
        raceRef.current = { stage: -1, startedAt: 0 };
        finishRaceRef.current?.(ms);
      }
    }, 200);

    animFrameRef.current = requestAnimationFrame(loop);
    setScreen('playing');
  }, [classData, studentData, getMeInfo, setupListeners, syncStallToRTDB, loop, showToast]);

  const leaveTownSquare = useCallback(() => {
    clearInterval(networkIntervalRef.current);
    clearInterval(flushIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const code = roomCodeRef.current;
    if (myPlayerDbRef.current) remove(myPlayerDbRef.current).catch(() => {});
    if (code) {
      off(ref(database, `worldRooms/${code}/players`));
      off(ref(database, `worldRooms/${code}/stalls`));
      off(ref(database, `worldRooms/${code}/challenges`));
      off(ref(database, `worldRooms/${code}/chat`));
      off(ref(database, `worldRooms/${code}/events`));
      off(ref(database, `worldRooms/${code}/shop`));
      off(ref(database, `worldRooms/${code}/winTally/${dayKey()}`));
      off(ref(database, `worldRooms/${code}/plazaRace/${dayKey()}`));
      off(ref(database, `worldRooms/${code}/pendingIncome/${myIdRef.current}`));
    }
    setScreen('menu');
    setActiveModal(null);
  }, []);

  useEffect(() => () => leaveTownSquare(), [leaveTownSquare]);

  // ── Keyboard controls ──────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'playing') return;
    const down = (e) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      const k = keysRef.current;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { k.up = true; e.preventDefault(); }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { k.down = true; e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { k.left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { k.right = true; e.preventDefault(); }
    };
    const up = (e) => {
      const k = keysRef.current;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') k.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') k.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') k.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') k.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [screen]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Detect touch-capable devices (iPads included) so the on-screen d-pad
  // shows up for them. We deliberately don't gate this on screen width —
  // iPads report widths well above Tailwind's `md` breakpoint, so a
  // width-based check was hiding the controls on exactly the devices that
  // need them (no physical keyboard).
  useEffect(() => {
    const touchCapable = (typeof window !== 'undefined' && 'ontouchstart' in window) || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
    setIsTouchDevice(!!touchCapable);
  }, []);

  // Track the actual rendered viewport size so the camera knows how much of
  // the (much bigger) world it can show at once.
  useEffect(() => {
    if (screen !== 'playing' || !containerRef.current) return;
    const el = containerRef.current;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      viewportSizeRef.current = { w: rect.width || 900, h: rect.height || 600 };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [screen, isFullscreen]);

  // ═══════════════════════════════════════════════════════════════════════
  // CHAT
  // ═══════════════════════════════════════════════════════════════════════
  const sendChat = useCallback((e) => {
    e?.preventDefault();
    const text = chatInput.trim().slice(0, 80);
    if (!text || !roomCodeRef.current) return;
    if (containsProfanity(text)) {
      showToast?.("Let's keep the chat friendly! That message wasn't sent.", 'error');
      setChatInput('');
      return;
    }
    const msg = { pid: myIdRef.current, name: myName, text, at: Date.now() };
    const day = dayKey();
    push(ref(database, `worldRooms/${roomCodeRef.current}/chat`), msg).catch(() => {});
    // Archive for the teacher's Town Watch (kept even if the live chat is cleared)
    push(ref(database, `worldRooms/${roomCodeRef.current}/chatArchive/${day}`), msg).catch(() => {});
    set(ref(database, `worldRooms/${roomCodeRef.current}/archiveDays/${day}`), true).catch(() => {});
    bumpDaily('chats');
    setChatInput('');
  }, [chatInput, myName, showToast]);

  useEffect(() => { chatEndRef.current?.scrollIntoView?.({ behavior: 'smooth' }); }, [chatLog, chatOpen]);

  // ═══════════════════════════════════════════════════════════════════════
  // STALLS — build / manage / buy
  // ═══════════════════════════════════════════════════════════════════════
  const stallsByPlot = useMemo(() => {
    const map = {};
    Object.values(stalls).forEach((s) => { if (s?.plotId) map[s.plotId] = s; });
    return map;
  }, [stalls]);

  const myStall = localTownSquareRef.current.stall;

  const buildStall = useCallback((plotId) => {
    if (myStall) { showToast?.('You already own a stall — abandon it first to relocate.', 'error'); return; }
    if (!isNear({ x: PLOTS.find((p) => p.id === plotId)?.x, y: PLOTS.find((p) => p.id === plotId)?.y })) { showToast?.('Walk closer to the plot first!', 'error'); return; }
    const tier = STALL_TIERS[0];
    if (!canAfford(localHomesteadRef.current.inv, tier.cost)) { showToast?.(`You need ${fmtCost(tier.cost, ITEMS)} to build this!`, 'error'); return; }
    localHomesteadRef.current.inv = deductCost(localHomesteadRef.current.inv, tier.cost);
    localTownSquareRef.current.stall = { plotId, tier: 1, theme: 'gold', listings: {}, builtAt: Date.now() };
    saveBoth();
    syncStallToRTDB(localTownSquareRef.current.stall);
    showToast?.(`${tier.name} built! 🎉`, 'success');
    pushEvent(`🔨 ${myName} opened a market stall in the square!`, 'stall');
    setActiveModal(null);
    forceTick((n) => n + 1);
  }, [myStall, saveBoth, syncStallToRTDB, showToast, pushEvent, myName]);

  const upgradeStall = useCallback(() => {
    const stall = localTownSquareRef.current.stall;
    if (!stall) return;
    const plot = PLOTS.find((p) => p.id === stall.plotId);
    if (!isNear(plot)) { showToast?.('Walk closer to your stall first!', 'error'); return; }
    const nextTier = STALL_TIERS[stall.tier]; // tiers array is 0-indexed, stall.tier is 1-indexed current
    if (!nextTier) { showToast?.('Your stall is already fully upgraded!', 'info'); return; }
    if (!canAfford(localHomesteadRef.current.inv, nextTier.cost)) { showToast?.(`You need ${fmtCost(nextTier.cost, ITEMS)} to upgrade!`, 'error'); return; }
    localHomesteadRef.current.inv = deductCost(localHomesteadRef.current.inv, nextTier.cost);
    stall.tier = nextTier.tier;
    saveBoth();
    syncStallToRTDB(stall);
    showToast?.(`Upgraded to ${nextTier.name}! 🏆`, 'success');
    forceTick((n) => n + 1);
  }, [saveBoth, syncStallToRTDB, showToast]);

  const setStallTheme = useCallback((themeId) => {
    const stall = localTownSquareRef.current.stall;
    if (!stall) return;
    stall.theme = themeId;
    saveBoth();
    syncStallToRTDB(stall);
    forceTick((n) => n + 1);
  }, [saveBoth, syncStallToRTDB]);

  const stockItem = useCallback((itemId, qty, price) => {
    const stall = localTownSquareRef.current.stall;
    if (!stall || qty <= 0 || price < 0) return;
    const tierCfg = STALL_TIERS[stall.tier - 1];
    const slotsUsed = Object.keys(stall.listings).length;
    if (!stall.listings[itemId] && slotsUsed >= tierCfg.slots) { showToast?.('Stall is full — upgrade for more space!', 'error'); return; }
    const have = localHomesteadRef.current.inv[itemId] || 0;
    if (have < qty) { showToast?.("You don't have that many to stock!", 'error'); return; }
    localHomesteadRef.current.inv[itemId] = have - qty;
    if (localHomesteadRef.current.inv[itemId] <= 0) delete localHomesteadRef.current.inv[itemId];
    const existing = stall.listings[itemId];
    stall.listings[itemId] = { qty: (existing?.qty || 0) + qty, price: Math.max(0, Math.floor(price)) };
    saveBoth();
    syncStallToRTDB(stall);
    showToast?.(`Stocked ${qty}× ${ITEMS[itemId]?.name}!`, 'success');
    forceTick((n) => n + 1);
  }, [saveBoth, syncStallToRTDB, showToast]);

  const unstockItem = useCallback((itemId) => {
    const stall = localTownSquareRef.current.stall;
    if (!stall || !stall.listings[itemId]) return;
    const qty = stall.listings[itemId].qty || 0;
    localHomesteadRef.current.inv[itemId] = (localHomesteadRef.current.inv[itemId] || 0) + qty;
    delete stall.listings[itemId];
    saveBoth();
    syncStallToRTDB(stall);
    forceTick((n) => n + 1);
  }, [saveBoth, syncStallToRTDB]);

  const abandonStall = useCallback(() => {
    const stall = localTownSquareRef.current.stall;
    if (!stall) return;
    Object.entries(stall.listings || {}).forEach(([itemId, l]) => {
      localHomesteadRef.current.inv[itemId] = (localHomesteadRef.current.inv[itemId] || 0) + (l.qty || 0);
    });
    localTownSquareRef.current.stall = null;
    saveBoth();
    syncStallToRTDB(null);
    setActiveModal(null);
    showToast?.('Stall packed up — your stock was returned to your inventory.', 'info');
    forceTick((n) => n + 1);
  }, [saveBoth, syncStallToRTDB, showToast]);

  const buyItem = useCallback(async (sellerId, itemId) => {
    const stall = stalls[sellerId];
    const listing = stall?.listings?.[itemId];
    if (!stall || !listing || listing.qty <= 0) { showToast?.('Sold out!', 'error'); return; }
    if (sellerId === myIdRef.current) { showToast?.("That's your own stall!", 'error'); return; }
    const plot = PLOTS.find((p) => p.id === stall.plotId);
    if (!isNear(plot)) { showToast?.('Walk closer to the stall first!', 'error'); return; }
    if ((localHomesteadRef.current.gold || 0) < listing.price) { showToast?.('Not enough gold!', 'error'); return; }

    try {
      const result = await runTransaction(ref(database, `worldRooms/${roomCodeRef.current}/stalls/${sellerId}/listings/${itemId}/qty`), (cur) => {
        if (typeof cur !== 'number' || cur <= 0) return; // undefined = abort the transaction
        return cur - 1;
      });
      if (!result.committed) { showToast?.('Sold out!', 'error'); return; }

      localHomesteadRef.current.gold -= listing.price;
      localHomesteadRef.current.inv[itemId] = (localHomesteadRef.current.inv[itemId] || 0) + 1;
      await saveHomestead();
      await push(ref(database, `worldRooms/${roomCodeRef.current}/pendingIncome/${sellerId}`), {
        itemId, price: listing.price, buyerName: myName, at: Date.now(),
      });
      showToast?.(`Bought ${ITEMS[itemId]?.name}! 🛍️`, 'success');
      bumpDaily('buys');
      pushEvent(`🛍️ ${myName} bought ${ITEMS[itemId]?.name} from ${stall.ownerName}'s stall!`, 'trade');
      forceTick((n) => n + 1);
    } catch {
      showToast?.('Purchase failed — try again.', 'error');
    }
  }, [stalls, myName, saveHomestead, showToast, pushEvent]);

  const isNear = (target) => target && dist(myPosRef.current, target) <= INTERACT_RADIUS;

  // ═══════════════════════════════════════════════════════════════════════
  // CHALLENGES
  // ═══════════════════════════════════════════════════════════════════════
  const sendChallenge = useCallback((opponentId, opponentName, gameId) => {
    if (!roomCodeRef.current) return;
    const alreadyActive = Object.values(challengesRef.current || {}).some(
      (c) => c.status === 'active' && (c.from?.id === myIdRef.current || c.to?.id === myIdRef.current)
    );
    if (alreadyActive) { showToast?.('Finish your current game first!', 'error'); return; }
    const challengeId = `c_${myIdRef.current}_${Date.now()}`;
    set(ref(database, `worldRooms/${roomCodeRef.current}/challenges/${challengeId}`), {
      game: gameId, from: { id: myIdRef.current, name: myName }, to: { id: opponentId, name: opponentName },
      status: 'pending', createdAt: Date.now(),
    }).catch(() => {});
    showToast?.(`Challenge sent to ${opponentName}!`, 'success');
    setActiveModal(null);
    setTimeout(() => {
      const cur = challengesRef.current[challengeId];
      if (cur && cur.status === 'pending') remove(ref(database, `worldRooms/${roomCodeRef.current}/challenges/${challengeId}`)).catch(() => {});
    }, 20000);
  }, [myName, showToast]);

  const respondChallenge = useCallback((challengeId, accept) => {
    if (!roomCodeRef.current) return;
    if (accept) update(ref(database, `worldRooms/${roomCodeRef.current}/challenges/${challengeId}`), { status: 'active' }).catch(() => {});
    else remove(ref(database, `worldRooms/${roomCodeRef.current}/challenges/${challengeId}`)).catch(() => {});
  }, []);

  const incomingChallenge = useMemo(
    () => Object.entries(challenges).find(([, c]) => c.to?.id === myIdRef.current && c.status === 'pending'),
    [challenges]
  );
  const myActiveChallenge = useMemo(
    () => Object.entries(challenges).find(([, c]) => c.status === 'active' && (c.from?.id === myIdRef.current || c.to?.id === myIdRef.current)),
    [challenges]
  );

  // Who's mid-duel right now → { playerId: opponentName } (for ⚔️ badges)
  const duelists = useMemo(() => {
    const map = {};
    Object.values(challenges).forEach((c) => {
      if (c.status !== 'active') return;
      if (c.from?.id) map[c.from.id] = c.to?.name || '?';
      if (c.to?.id) map[c.to.id] = c.from?.name || '?';
    });
    return map;
  }, [challenges]);

  useEffect(() => {
    Object.entries(challenges).forEach(([id, c]) => {
      if (c.from?.id === myIdRef.current && c.status === 'declined') {
        showToast?.(`${c.to?.name} declined your challenge.`, 'info');
        remove(ref(database, `worldRooms/${roomCodeRef.current}/challenges/${id}`)).catch(() => {});
      }
    });
  }, [challenges, showToast]);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER — MENU
  // ═══════════════════════════════════════════════════════════════════════
  if (screen === 'menu') {
    return (
      <div className="bg-gradient-to-br from-amber-800 via-orange-700 to-rose-800 rounded-3xl p-8 text-white text-center min-h-[520px] flex items-center justify-center shadow-2xl border border-amber-900/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0,transparent_60%)] pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <div className="text-7xl mb-4">🏘️</div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-yellow-200 to-orange-100 bg-clip-text text-transparent drop-shadow-lg">
            Town Square
          </h2>
          <p className="text-lg mb-6 text-amber-100">
            Explore a big plaza with your classmates — the view follows you as you walk! Chat, build a market stall with Wildwood resources to trade your spare loot, and challenge friends to quick minigames.
          </p>

          <div className="grid grid-cols-2 gap-3 text-left text-sm mb-6 bg-black/20 rounded-2xl p-4">
            <div className="flex items-start gap-2"><span className="text-xl">🕹️</span> Move with WASD / arrow keys</div>
            <div className="flex items-start gap-2"><span className="text-xl">💬</span> Chat with everyone nearby</div>
            <div className="flex items-start gap-2"><span className="text-xl">🏪</span> Build a stall from Wildwood loot</div>
            <div className="flex items-start gap-2"><span className="text-xl">⚔️</span> Challenge classmates to duels</div>
          </div>

          <div className="mb-6 p-4 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10">
            <div className="text-amber-200 text-xs uppercase tracking-wider mb-1">Current Class Room</div>
            <div className="text-2xl font-bold tracking-widest text-yellow-300 font-mono">{classData?.classCode || 'NO CODE'}</div>
          </div>

          <button
            onClick={joinTownSquare}
            disabled={!classData?.classCode}
            className={`w-full py-5 rounded-2xl font-bold text-2xl shadow-xl transition-all ${
              classData?.classCode ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-amber-950 hover:scale-[1.02]' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {classData?.classCode ? '🚪 Enter Town Square' : 'Missing Class Code'}
          </button>

          {onSwitchGame && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] font-bold">
              <span className="text-white/50">Linked worlds:</span>
              <button onClick={() => onSwitchGame('wildwood-homestead')} className="flex items-center gap-1.5 bg-black/30 hover:bg-black/50 border border-white/20 rounded-full px-3 py-1 transition">🏕️ Wildwood Homestead</button>
              <button onClick={() => onSwitchGame('champions-menagerie')} className="flex items-center gap-1.5 bg-black/30 hover:bg-black/50 border border-white/20 rounded-full px-3 py-1 transition">🐣 Champion&apos;s Menagerie</button>
              <button onClick={() => onSwitchGame('sweet-empire')} className="flex items-center gap-1.5 bg-black/30 hover:bg-black/50 border border-white/20 rounded-full px-3 py-1 transition">⚔️ Champion&apos;s Forge</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER — WORLD
  // ═══════════════════════════════════════════════════════════════════════
  const now = Date.now();
  const opponentInfo = myActiveChallenge
    ? (myActiveChallenge[1].from.id === myIdRef.current ? myActiveChallenge[1].to : myActiveChallenge[1].from)
    : null;

  return (
    <div
      ref={containerRef}
      className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/40 select-none"
      style={{
        height: isFullscreen ? '100vh' : 'min(78vh, 640px)',
        minHeight: 460,
        background: 'radial-gradient(circle at 50% 60%, #d6b370 0%, #b58a4a 35%, #8a6636 70%, #6b4d26 100%)',
      }}
    >
      {/* Header */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3 bg-black/35 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-white font-bold bg-black/30 rounded-xl px-3 py-1.5">
            <img src={GOLD_ICON} alt="" className="w-5 h-5" />
            {fmtQty(localHomesteadRef.current?.gold || 0)}
          </div>
          {onSwitchGame && (
            <div className="hidden sm:flex items-center gap-1 bg-black/30 rounded-xl px-1.5 py-1">
              <button onClick={() => onSwitchGame('wildwood-homestead')} title="Wildwood Homestead" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-lg">🏕️</button>
              <button onClick={() => onSwitchGame('champions-menagerie')} title="Champion's Menagerie" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center overflow-hidden">
                <img src="/shop/Egg/Egg.png" alt="" className="w-5 h-5 object-contain" />
              </button>
              <button onClick={() => onSwitchGame('sweet-empire')} title="Champion's Forge" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-lg">⚔️</button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-white/90 text-sm font-bold bg-black/30 rounded-xl px-3 py-1.5" title="Students in town right now">
            👥 {Object.keys(remotePlayers).length + 1}
          </div>
          <button onClick={() => setChampionsOpen((o) => !o)} className="bg-amber-400/20 text-amber-100 border border-amber-300/30 px-3 py-1.5 rounded-xl text-sm font-semibold hover:bg-amber-400/40" title="Today's duel champions">
            🏆
          </button>
          <button onClick={() => setChatOpen((o) => !o)} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-sm font-semibold">
            💬 Chat
          </button>
          <button onClick={toggleFullscreen} className="bg-blue-500/20 text-blue-100 border border-blue-300/30 px-3 py-1.5 rounded-xl text-sm font-semibold hover:bg-blue-500/40">
            ⛶
          </button>
          <button onClick={leaveTownSquare} className="bg-red-500/20 text-red-100 border border-red-300/30 px-3 py-1.5 rounded-xl text-sm font-semibold hover:bg-red-500/40">
            Leave
          </button>
        </div>
      </div>

      {/* World — a viewport clipped to the panel, with a much bigger scrollable
          world inside it. The inner div is moved directly via a ref in the
          animation loop (not React state) so following the player stays smooth. */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={worldDivRef}
          className="absolute top-0 left-0"
          style={{
            width: WORLD_W,
            height: WORLD_H,
            background: `radial-gradient(circle at 50% 50%, #8fbf6a 0%, #7fae5c 30%, #699549 60%, #4f7636 85%, #3c5c2a 100%)`,
            willChange: 'transform',
            transform: `translate3d(${-cameraRef.current.x}px, ${-cameraRef.current.y}px, 0)`,
          }}
        >
          <style>{`
            @keyframes ts-bounce { 0%,100% { transform: translate(-50%,-100%) scale(1); } 50% { transform: translate(-50%,-115%) scale(1.15); } }
            @keyframes ts-banner { 0% { opacity: 0; transform: translate(-50%,-16px); } 12% { opacity: 1; transform: translate(-50%,0); } 88% { opacity: 1; } 100% { opacity: 0; } }
            @keyframes ts-duel { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
          `}</style>

          {/* Stone plaza circle + sandy paths (ground detailing) */}
          <div className="absolute rounded-full pointer-events-none" style={{
            left: WORLD_W / 2, top: WORLD_H / 2, width: 680, height: 680, transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, #d8cfb8 0%, #cbc0a4 45%, #b5a888 78%, #9c8f70 100%)',
            border: '10px solid #8b7c5c', boxShadow: 'inset 0 0 60px rgba(0,0,0,0.18)',
          }} />
          <div className="absolute rounded-full pointer-events-none" style={{
            left: WORLD_W / 2, top: WORLD_H / 2, width: 240, height: 240, transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, #bfe3f0 0%, #9ecfe2 55%, #8b7c5c 58%, transparent 60%)',
            opacity: 0.9,
          }} />
          <div className="absolute pointer-events-none" style={{
            left: 0, top: WORLD_H / 2 - 45, width: WORLD_W, height: 90,
            background: 'linear-gradient(rgba(216,207,184,0), rgba(216,207,184,0.75) 30%, rgba(216,207,184,0.75) 70%, rgba(216,207,184,0))',
          }} />
          <div className="absolute pointer-events-none" style={{
            left: WORLD_W / 2 - 45, top: 0, width: 90, height: WORLD_H,
            background: 'linear-gradient(90deg, rgba(216,207,184,0), rgba(216,207,184,0.75) 30%, rgba(216,207,184,0.75) 70%, rgba(216,207,184,0))',
          }} />

          {DECOR.map((d, i) => (
            <div
              key={i}
              className="absolute pointer-events-none opacity-95"
              style={{ left: d.x, top: d.y, transform: 'translate(-50%,-50%)' }}
            >
              {d.img ? (
                <img src={d.img} alt="" style={{ width: d.size, height: d.size }} className="object-contain drop-shadow" />
              ) : (
                <span style={{ fontSize: d.size, lineHeight: 1 }}>{d.emoji}</span>
              )}
            </div>
          ))}

          {/* The Wishing Fountain */}
          <button
            onClick={() => { setWishResult(null); setActiveModal({ type: 'fountain' }); }}
            className="absolute flex flex-col items-center z-10"
            style={{ left: FOUNTAIN.x, top: FOUNTAIN.y, transform: 'translate(-50%,-50%)' }}
          >
            <img src={FOUNTAIN_IMG} alt="" className="w-32 h-32 object-contain drop-shadow-xl" />
            <div className="text-[11px] font-bold text-sky-950 bg-sky-200/95 border border-sky-500/50 rounded-full px-2.5 py-0.5 -mt-3 shadow">
              ⛲ Wishing Fountain
            </div>
          </button>

          {/* Plaza race circuit — start line + numbered flags */}
          <div className="absolute flex flex-col items-center z-10 pointer-events-none" style={{ left: RACE_START.x, top: RACE_START.y, transform: 'translate(-50%,-50%)' }}>
            <img src={RACE_FLAG_IMG} alt="" className="w-14 h-14 object-contain drop-shadow" />
            <div className="text-[10px] font-bold text-white bg-emerald-700/90 rounded-full px-2 py-0.5 -mt-1 shadow">🏁 START — run the flags!</div>
          </div>
          {RACE_CHECKPOINTS.map((c, i) => (
            <div key={i} className="absolute flex flex-col items-center z-10 pointer-events-none" style={{ left: c.x, top: c.y, transform: 'translate(-50%,-50%)' }}>
              <img src={RACE_FLAG_IMG} alt="" className="w-12 h-12 object-contain drop-shadow" />
              <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-amber-700 text-amber-950 text-xs font-black flex items-center justify-center -mt-2 shadow">{i + 1}</div>
            </div>
          ))}

          {/* The Notice Board — daily quests + treasure hint */}
          <button
            onClick={() => setActiveModal({ type: 'quests' })}
            className="absolute flex flex-col items-center z-10"
            style={{ left: NOTICEBOARD.x, top: NOTICEBOARD.y, transform: 'translate(-50%,-50%)' }}
          >
            <img src={NOTICEBOARD_IMG} alt="" className="w-24 h-24 object-contain drop-shadow-xl" />
            <div className="text-[11px] font-bold text-emerald-950 bg-emerald-200/95 border border-emerald-600/50 rounded-full px-2.5 py-0.5 -mt-2 shadow">
              📋 Daily Quests
            </div>
            {(() => {
              const claimable = questsForDay(dayKey()).filter((q) => !questClaims().includes(q.id) && questProgress(q) >= q.need).length;
              return claimable > 0 && (
                <div className="text-[10px] font-bold text-white bg-emerald-600/95 rounded-full px-2 py-0.5 mt-0.5 animate-pulse">{claimable} ready to claim!</div>
              );
            })()}
          </button>

          {/* Today's buried treasure — appears only when you're right on top of it */}
          {treasureVisible && !treasureFound() && todaysTreasure && (
            <button
              onClick={claimTreasure}
              className="absolute flex flex-col items-center z-20"
              style={{ left: todaysTreasure.x, top: todaysTreasure.y, transform: 'translate(-50%,-50%)' }}
            >
              <img src={TREASURE_CROSS_IMG} alt="" className="w-14 h-14 object-contain drop-shadow-xl" style={{ animation: 'ts-bounce 0.8s ease-in-out infinite' }} />
              <div className="text-[10px] font-bold text-amber-950 bg-amber-300/95 rounded-full px-2 py-0.5 animate-pulse shadow">DIG HERE!</div>
            </button>
          )}

          {/* The Wandering Merchant caravan (class-shared shop) */}
          <button
            onClick={() => setActiveModal({ type: 'shop' })}
            className="absolute flex flex-col items-center z-10"
            style={{ left: MERCHANT.x, top: MERCHANT.y, transform: 'translate(-50%,-50%)' }}
          >
            <img src={MERCHANT_IMG} alt="" className="w-28 h-28 object-contain drop-shadow-xl" />
            <div className="text-[11px] font-bold text-amber-950 bg-amber-300/95 border border-amber-600/50 rounded-full px-2.5 py-0.5 -mt-2 shadow">
              🎪 Wandering Merchant
            </div>
            {shopState?.stock && Object.values(shopState.stock).every((s) => (s?.qty || 0) <= 0) && (
              <div className="text-[10px] font-bold text-white bg-rose-600/90 rounded-full px-2 py-0.5 mt-0.5 animate-pulse">SOLD OUT — help restock!</div>
            )}
          </button>

          {/* Plots */}
          {PLOTS.map((plot) => {
            const stall = stallsByPlot[plot.id];
            const tierCfg = stall ? STALL_TIERS[stall.tier - 1] : null;
            return (
              <button
                key={plot.id}
                onClick={() => setActiveModal(stall ? (stall.ownerId === myIdRef.current ? { type: 'manage' } : { type: 'browse', sellerId: stall.ownerId }) : { type: 'build', plotId: plot.id })}
                className="absolute flex flex-col items-center z-10"
                style={{ left: plot.x, top: plot.y, transform: 'translate(-50%,-50%)' }}
              >
                {stall ? (
                  <div className="rounded-xl px-2 py-1.5 shadow-lg text-center border-2 border-white/40" style={{ background: themeColor(stall.theme) }}>
                    <img src={tierCfg?.img} alt="" className="w-9 h-9 mx-auto object-contain drop-shadow" />
                    <div className="text-[10px] font-bold text-white max-w-[70px] truncate">{stall.ownerName}</div>
                  </div>
                ) : (
                  <div className="rounded-xl px-2 py-1.5 border-2 border-dashed border-white/50 text-white/80 text-center bg-black/25">
                    <img src={EMPTY_PLOT_IMG} alt="" className="w-8 h-8 mx-auto object-contain opacity-70" />
                    <div className="text-[9px]">Empty Plot</div>
                  </div>
                )}
              </button>
            );
          })}

          {/* Remote players */}
          {Object.entries(remotePlayers).map(([id, p]) => {
            const dueling = duelists[id];
            const emoteFresh = p.emote && now - (p.emote.at || 0) < 3000;
            return (
              <button
                key={id}
                onClick={() => setActiveModal({ type: 'player', id, ...p })}
                className="absolute flex flex-col items-center z-20"
                style={{ left: p.x, top: p.y, transition: 'left 0.15s linear, top 0.15s linear', transform: 'translate(-50%,-50%)' }}
              >
                {emoteFresh && (
                  <div className="absolute -top-1 left-1/2 text-2xl pointer-events-none" style={{ animation: 'ts-bounce 0.7s ease-in-out infinite' }}>{p.emote.e}</div>
                )}
                {p.bubble && p.bubble.expiresAt > now && !emoteFresh && (
                  <div className="bg-white text-slate-800 text-xs rounded-xl px-2 py-1 mb-1 shadow max-w-[110px] truncate">{p.bubble.text}</div>
                )}
                <div className="relative">
                  <img
                    src={getAvatarImage(p.avatarBase, p.level)}
                    alt=""
                    className={`w-10 h-10 rounded-full border-2 shadow-lg bg-white/80 ${dueling ? 'ring-2 ring-rose-400 animate-pulse' : ''}`}
                    style={{ borderColor: p.ring || '#fff' }}
                  />
                  {dueling && <span className="absolute -top-2 -right-2 text-sm" style={{ animation: 'ts-duel 0.5s ease-in-out infinite' }}>⚔️</span>}
                </div>
                <div className="w-7 h-1.5 bg-black/25 rounded-full blur-[1.5px] -mt-0.5" />
                <div className="text-[10px] font-bold text-white bg-black/55 rounded px-1.5 mt-0.5 max-w-[90px] truncate">
                  {p.name}{dueling ? ` ⚔ vs ${dueling}` : ''}
                </div>
              </button>
            );
          })}

          {/* Remote players' Menagerie companions pad along beside them */}
          {Object.entries(remotePlayers).map(([id, p]) => p.companion && (
            <img
              key={`comp_${id}`}
              src={p.companion.img}
              alt=""
              title={`${p.name}'s companion ${p.companion.name}`}
              className="absolute w-7 h-7 rounded-full object-cover border border-white/70 shadow z-10 pointer-events-none"
              style={{
                left: (p.x || 0) - 30, top: (p.y || 0) + 12,
                transform: 'translate(-50%,-50%)',
                transition: 'left 0.35s linear, top 0.35s linear',
                filter: p.companion.shiny ? 'hue-rotate(45deg) saturate(1.7) brightness(1.05)' : undefined,
              }}
            />
          ))}

          {/* My companion (smooth lagged follow via the animation loop) */}
          {getMeInfo().companion && (
            <img
              ref={companionDivRef}
              src={getMeInfo().companion.img}
              alt=""
              className="absolute w-8 h-8 rounded-full object-cover border border-yellow-200/80 shadow z-10 pointer-events-none"
              style={{
                left: myPosRef.current.x - 30, top: myPosRef.current.y + 12,
                transform: 'translate(-50%,-50%)',
                filter: getMeInfo().companion.shiny ? 'hue-rotate(45deg) saturate(1.7) brightness(1.05)' : undefined,
              }}
            />
          )}

          {/* Me */}
          <div ref={avatarDivRef} className="absolute flex flex-col items-center z-20 pointer-events-none" style={{ left: myPosRef.current.x, top: myPosRef.current.y, transform: 'translate(-50%,-50%)' }}>
            {myEmote && now - myEmote.at < 3000 && (
              <div className="absolute -top-1 left-1/2 text-2xl" style={{ animation: 'ts-bounce 0.7s ease-in-out infinite' }}>{myEmote.e}</div>
            )}
            {myBubble && myBubble.expiresAt > now && !(myEmote && now - myEmote.at < 3000) && (
              <div className="bg-yellow-300 text-slate-900 text-xs rounded-xl px-2 py-1 mb-1 shadow max-w-[110px] truncate">{myBubble.text}</div>
            )}
            <div className="relative">
              <img src={myAvatarSrc} alt="" className={`w-11 h-11 rounded-full border-2 border-yellow-300 shadow-xl bg-white/80 ${duelists[myIdRef.current] ? 'ring-2 ring-rose-400 animate-pulse' : ''}`} />
              {duelists[myIdRef.current] && <span className="absolute -top-2 -right-2 text-sm" style={{ animation: 'ts-duel 0.5s ease-in-out infinite' }}>⚔️</span>}
            </div>
            <div className="w-8 h-1.5 bg-black/25 rounded-full blur-[1.5px] -mt-0.5" />
            <div className="text-[10px] font-bold text-white bg-black/65 rounded px-1.5 mt-0.5">{myName}</div>
          </div>
        </div>

        {/* Soft vignette over the viewport */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(20,15,5,0.28) 100%)' }} />
      </div>

      {/* Town announcement banner */}
      {banner && (
        <div
          key={banner.id}
          className="absolute top-14 left-1/2 z-30 max-w-[85%] pointer-events-none"
          style={{ animation: `ts-banner ${EVENT_BANNER_MS}ms ease-in-out forwards`, transform: 'translate(-50%,0)' }}
        >
          <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-bold text-sm rounded-full px-5 py-2 shadow-xl border-2 border-amber-600/40 whitespace-nowrap overflow-hidden text-ellipsis">
            📣 {banner.text}
          </div>
        </div>
      )}

      {/* Today's champions panel */}
      {championsOpen && (
        <div className="absolute top-14 left-3 z-30 w-56 bg-black/60 backdrop-blur-md rounded-2xl border border-amber-300/20 p-3">
          <div className="text-amber-300 font-bold text-sm mb-2">🏆 Today&apos;s Champions</div>
          {Object.entries(tally).sort((a, b) => (b[1]?.wins || 0) - (a[1]?.wins || 0)).slice(0, 5).map(([pid, t], i) => (
            <div key={pid} className="flex items-center gap-2 text-white/90 text-xs py-1">
              <span className="w-5 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <span className="flex-1 truncate font-semibold">{t?.name || '?'}</span>
              <span className="text-amber-300 font-bold">{t?.wins || 0} wins</span>
            </div>
          ))}
          {Object.keys(tally).length === 0 && <div className="text-white/40 text-xs py-2 text-center">No duels won yet today — be the first!</div>}
          <div className="text-amber-300 font-bold text-sm mt-3 mb-1 border-t border-white/10 pt-2">🏁 Fastest Plaza Laps</div>
          {Object.entries(raceBoard).sort((a, b) => (a[1]?.ms || Infinity) - (b[1]?.ms || Infinity)).slice(0, 5).map(([pid, r], i) => (
            <div key={pid} className="flex items-center gap-2 text-white/90 text-xs py-1">
              <span className="w-5 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <span className="flex-1 truncate font-semibold">{r?.name || '?'}</span>
              <span className="text-emerald-300 font-bold">{((r?.ms || 0) / 1000).toFixed(1)}s</span>
            </div>
          ))}
          {Object.keys(raceBoard).length === 0 && <div className="text-white/40 text-xs py-1 text-center">No laps run yet — find the 🏁 start line!</div>}
        </div>
      )}

      {/* Minimap */}
      <div className="absolute bottom-16 left-3 z-30 rounded-xl border border-white/20 bg-black/45 backdrop-blur-sm p-1 hidden sm:block" style={{ width: 148, height: 98 }}>
        <div className="relative w-full h-full overflow-hidden rounded-lg" style={{ background: 'radial-gradient(circle, #5b7c44 0%, #46613558 100%)' }}>
          <div className="absolute rounded-full bg-white/20" style={{ left: '50%', top: '50%', width: 42, height: 42, transform: 'translate(-50%,-50%)' }} />
          <img src={MERCHANT_IMG} alt="" className="absolute w-4 h-4 object-contain" style={{ left: `${(MERCHANT.x / WORLD_W) * 100}%`, top: `${(MERCHANT.y / WORLD_H) * 100}%`, transform: 'translate(-50%,-50%)' }} />
          {PLOTS.map((pl) => {
            const s = stallsByPlot[pl.id];
            return <div key={pl.id} className="absolute w-1.5 h-1.5 rounded-sm" style={{ left: `${(pl.x / WORLD_W) * 100}%`, top: `${(pl.y / WORLD_H) * 100}%`, transform: 'translate(-50%,-50%)', background: s ? themeColor(s.theme) : 'rgba(255,255,255,0.35)' }} />;
          })}
          {Object.values(remotePlayers).map((p, i) => (
            <div key={i} className="absolute w-1.5 h-1.5 rounded-full" style={{ left: `${((p.x || 0) / WORLD_W) * 100}%`, top: `${((p.y || 0) / WORLD_H) * 100}%`, transform: 'translate(-50%,-50%)', background: p.ring || '#fff' }} />
          ))}
          <div className="absolute w-2 h-2 rounded-full bg-yellow-300 border border-amber-700" style={{ left: `${(myPosRef.current.x / WORLD_W) * 100}%`, top: `${(myPosRef.current.y / WORLD_H) * 100}%`, transform: 'translate(-50%,-50%)' }} />
        </div>
      </div>

      {/* Chat panel */}
      {chatOpen && (
        <div className="absolute top-14 right-3 z-30 w-64 max-h-56 bg-black/55 backdrop-blur-md rounded-2xl border border-white/10 p-2 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-1 mb-1 pr-1">
            {chatLog.length === 0 && <div className="text-white/40 text-xs text-center py-4">No messages yet — say hi!</div>}
            {chatLog.map((m) => (
              m.sys
                ? <div key={m.id} className="text-[11px] text-amber-300/90 italic">{m.text}</div>
                : <div key={m.id} className="text-xs text-white/90"><span className="font-bold text-yellow-300">{m.name}:</span> {m.text}</div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}

      {/* Chat input + emote wheel */}
      <form onSubmit={sendChat} className={`absolute bottom-3 left-3 z-30 flex gap-2 ${isTouchDevice ? 'right-[190px]' : 'right-24'}`}>
        <div className="relative">
          <button type="button" onClick={() => setEmoteOpen((o) => !o)} className="h-full bg-black/45 border border-white/10 hover:border-yellow-300/60 text-lg rounded-xl px-2.5" title="Send an emote">
            😀
          </button>
          {emoteOpen && (
            <div className="absolute bottom-12 left-0 flex gap-1 bg-black/70 backdrop-blur-md rounded-2xl border border-white/15 p-1.5">
              {EMOTES.map((e) => (
                <button key={e} type="button" onClick={() => sendEmote(e)} className="text-xl hover:scale-125 transition-transform px-1">{e}</button>
              ))}
            </div>
          )}
        </div>
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          maxLength={80}
          placeholder="Say something…"
          className="flex-1 bg-black/45 text-white placeholder-white/40 rounded-xl px-3 py-2 text-sm outline-none border border-white/10 focus:border-yellow-300/60"
        />
        <button type="submit" className="bg-yellow-400 text-amber-950 font-bold px-4 py-2 rounded-xl text-sm">Send</button>
      </form>

      {/* Touch d-pad — shown on any touch-capable device (phones, iPads),
          not gated by screen width since iPads are plenty wide enough to be
          missed by a `md:hidden`-style breakpoint check. */}
      {isTouchDevice && (
        <div className="absolute bottom-20 right-3 z-30 grid grid-cols-3 grid-rows-3 gap-1.5 bg-black/30 backdrop-blur-sm rounded-2xl p-2">
          <div />
          <DpadBtn label="▲" onDown={() => (keysRef.current.up = true)} onUp={() => (keysRef.current.up = false)} />
          <div />
          <DpadBtn label="◀" onDown={() => (keysRef.current.left = true)} onUp={() => (keysRef.current.left = false)} />
          <div />
          <DpadBtn label="▶" onDown={() => (keysRef.current.right = true)} onUp={() => (keysRef.current.right = false)} />
          <div />
          <DpadBtn label="▼" onDown={() => (keysRef.current.down = true)} onUp={() => (keysRef.current.down = false)} />
          <div />
        </div>
      )}

      {/* Modals */}
      {activeModal?.type === 'build' && (
        <BuildModal
          plotId={activeModal.plotId}
          myStall={myStall}
          near={isNear(PLOTS.find((p) => p.id === activeModal.plotId))}
          inv={localHomesteadRef.current.inv}
          onBuild={buildStall}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === 'manage' && myStall && (
        <ManageStallModal
          stall={myStall}
          inv={localHomesteadRef.current.inv}
          near={isNear(PLOTS.find((p) => p.id === myStall.plotId))}
          onStock={stockItem}
          onUnstock={unstockItem}
          onUpgrade={upgradeStall}
          onTheme={setStallTheme}
          onAbandon={abandonStall}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === 'browse' && stalls[activeModal.sellerId] && (
        <BrowseStallModal
          stall={stalls[activeModal.sellerId]}
          myGold={localHomesteadRef.current.gold || 0}
          near={isNear(PLOTS.find((p) => p.id === stalls[activeModal.sellerId].plotId))}
          onBuy={(itemId) => buyItem(activeModal.sellerId, itemId)}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === 'player' && (
        <PlayerModal
          player={activeModal}
          wins={tally[activeModal.id]?.wins || 0}
          bestLap={raceBoard[activeModal.id]?.ms}
          near={isNear(activeModal)}
          onChallenge={(gameId) => sendChallenge(activeModal.id, activeModal.name, gameId)}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === 'fountain' && (
        <FountainModal
          myGold={localHomesteadRef.current.gold || 0}
          wishesUsed={wishesToday()}
          near={isNear(FOUNTAIN)}
          result={wishResult}
          onToss={tossCoin}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === 'quests' && (
        <QuestBoardModal
          quests={questsForDay(dayKey())}
          progressOf={questProgress}
          claimed={questClaims()}
          near={isNear(NOTICEBOARD)}
          treasureHintText={todaysTreasure ? treasureHint(todaysTreasure) : null}
          treasureDone={treasureFound()}
          onClaim={claimQuest}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === 'shop' && (
        <ShopModal
          shop={shopState}
          myGold={localHomesteadRef.current.gold || 0}
          myInv={localHomesteadRef.current.inv || {}}
          near={isNear(MERCHANT)}
          onBuy={buyShopItem}
          onDonate={donateToShop}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Incoming challenge */}
      {incomingChallenge && (
        <div className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-yellow-400/40 rounded-3xl p-6 max-w-sm w-full text-center text-white shadow-2xl">
            {MINIGAME_MAP[incomingChallenge[1].game]?.iconImg ? (
              <img src={MINIGAME_MAP[incomingChallenge[1].game].iconImg} alt="" className="w-16 h-16 mx-auto mb-3 object-contain" />
            ) : (
              <div className="text-5xl mb-3">{MINIGAME_MAP[incomingChallenge[1].game]?.icon}</div>
            )}
            <div className="text-lg font-bold mb-1">{incomingChallenge[1].from.name} challenges you!</div>
            <div className="text-white/60 text-sm mb-5">{MINIGAME_MAP[incomingChallenge[1].game]?.name}</div>
            <div className="flex gap-3">
              <button onClick={() => respondChallenge(incomingChallenge[0], false)} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold">Decline</button>
              <button onClick={() => respondChallenge(incomingChallenge[0], true)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold">Accept!</button>
            </div>
          </div>
        </div>
      )}

      {/* Active minigame */}
      {myActiveChallenge && opponentInfo && (
        <ChallengeOverlay
          classCode={roomCodeRef.current}
          challengeId={myActiveChallenge[0]}
          game={myActiveChallenge[1].game}
          myId={myIdRef.current}
          myName={myName}
          opponentId={opponentInfo.id}
          opponentName={opponentInfo.name}
          isHost={myActiveChallenge[1].from.id === myIdRef.current}
          onClose={() => {}}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Small shared bits
// ═══════════════════════════════════════════════════════════════════════════
const DpadBtn = ({ label, onDown, onUp }) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onDown(); }}
    onPointerUp={onUp}
    onPointerLeave={onUp}
    onPointerCancel={onUp}
    className="bg-white/15 active:bg-white/40 border border-white/20 text-white rounded-xl text-2xl font-bold flex items-center justify-center h-12 w-12 mx-auto touch-none select-none"
  >
    {label}
  </button>
);

const ModalShell = ({ title, icon, iconSrc, onClose, children }) => (
  <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm max-h-[90%] overflow-y-auto p-5 text-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-extrabold flex items-center gap-2">
          {iconSrc ? <img src={iconSrc} alt="" className="w-6 h-6 object-contain" /> : <span className="text-xl">{icon}</span>}
          {title}
        </h3>
        <button onClick={onClose} className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg px-2.5 py-1">✕</button>
      </div>
      {children}
    </div>
  </div>
);

const CostRow = ({ cost, inv }) => (
  <div className="space-y-1 mb-3">
    {Object.entries(cost).map(([id, qty]) => {
      const have = inv[id] || 0;
      const ok = have >= qty;
      return (
        <div key={id} className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-2 py-1">
          {ITEMS[id]?.img && <img src={ITEMS[id].img} alt="" className="w-5 h-5" style={ITEMS[id].tint ? { filter: ITEMS[id].tint } : undefined} />}
          <span className="flex-1">{ITEMS[id]?.name || id}</span>
          <span className={ok ? 'text-emerald-400' : 'text-rose-400'}>{have}/{qty}</span>
        </div>
      );
    })}
  </div>
);

function BuildModal({ plotId, myStall, near, inv, onBuild, onClose }) {
  const tier = STALL_TIERS[0];
  return (
    <ModalShell title="Empty Plot" iconSrc={EMPTY_PLOT_IMG} onClose={onClose}>
      {myStall ? (
        <div className="text-center text-white/70 text-sm py-4">
          You already own a stall. Abandon it from &quot;Manage Stall&quot; first if you&apos;d like to build here instead.
        </div>
      ) : (
        <>
          <img src={tier.img} alt="" className="w-16 h-16 mx-auto mb-2 object-contain" />
          <div className="text-center font-bold mb-1">{tier.name}</div>
          <div className="text-center text-white/50 text-xs mb-3">Holds {tier.slots} items for sale</div>
          <CostRow cost={tier.cost} inv={inv} />
          {!near && <div className="text-amber-300 text-xs text-center mb-2">Walk closer to build here.</div>}
          <button
            onClick={() => onBuild(plotId)}
            disabled={!near || !canAfford(inv, tier.cost)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-white/40 py-3 rounded-xl font-bold"
          >
            Build Stall
          </button>
        </>
      )}
    </ModalShell>
  );
}

function ManageStallModal({ stall, inv, near, onStock, onUnstock, onUpgrade, onTheme, onAbandon, onClose }) {
  const [pick, setPick] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(5);
  const tierCfg = STALL_TIERS[stall.tier - 1];
  const nextTier = STALL_TIERS[stall.tier];
  const invOptions = Object.entries(inv).filter(([, v]) => v > 0);

  return (
    <ModalShell title={`Your ${tierCfg.name}`} iconSrc={tierCfg.img} onClose={onClose}>
      <div className="mb-4">
        <div className="text-xs text-white/50 mb-1">Stock ({Object.keys(stall.listings).length}/{tierCfg.slots} slots)</div>
        {Object.keys(stall.listings).length === 0 && <div className="text-white/40 text-xs italic mb-2">Nothing stocked yet.</div>}
        <div className="space-y-1">
          {Object.entries(stall.listings).map(([itemId, l]) => (
            <div key={itemId} className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5 text-sm">
              {ITEMS[itemId]?.img && <img src={ITEMS[itemId].img} alt="" className="w-5 h-5" />}
              <span className="flex-1 truncate">{ITEMS[itemId]?.name}</span>
              <span className="text-white/50 text-xs">{l.qty}× @ {l.price}g</span>
              <button onClick={() => onUnstock(itemId)} className="text-rose-400 hover:text-rose-300 text-xs px-1.5">Take back</button>
            </div>
          ))}
        </div>
      </div>

      {near ? (
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="text-xs text-white/50 mb-2">Add to stall</div>
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="w-full bg-slate-800 text-white rounded-lg px-2 py-1.5 text-sm mb-2">
            <option value="">Choose an item…</option>
            {invOptions.map(([id, v]) => <option key={id} value={id}>{ITEMS[id]?.name} (have {v})</option>)}
          </select>
          <div className="flex gap-2 mb-2">
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-1/2 bg-slate-800 text-white rounded-lg px-2 py-1.5 text-sm" placeholder="Qty" />
            <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-1/2 bg-slate-800 text-white rounded-lg px-2 py-1.5 text-sm" placeholder="Price (gold)" />
          </div>
          <button
            disabled={!pick || qty < 1}
            onClick={() => { onStock(pick, qty, price); setPick(''); setQty(1); setPrice(5); }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-white/40 py-2 rounded-xl font-bold text-sm"
          >
            Stock Item
          </button>
        </div>
      ) : (
        <div className="text-amber-300 text-xs text-center mb-4">Walk closer to your stall to restock or upgrade it.</div>
      )}

      <div className="flex gap-1.5 mb-4 justify-center">
        {STALL_THEMES.map((t) => (
          <button key={t.id} onClick={() => onTheme(t.id)} className={`w-6 h-6 rounded-full border-2 ${stall.theme === t.id ? 'border-white' : 'border-transparent'}`} style={{ background: t.color }} title={t.label} />
        ))}
      </div>

      {nextTier && (
        <div className="bg-white/5 rounded-xl p-3 mb-3">
          <div className="text-xs text-white/50 mb-2">Upgrade to {nextTier.name} ({nextTier.slots} slots)</div>
          <CostRow cost={nextTier.cost} inv={inv} />
          <button onClick={onUpgrade} disabled={!near || !canAfford(inv, nextTier.cost)} className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-white/40 py-2 rounded-xl font-bold text-sm">
            Upgrade
          </button>
        </div>
      )}

      <button onClick={onAbandon} className="w-full bg-rose-900/50 hover:bg-rose-900/70 text-rose-200 py-2 rounded-xl text-sm font-semibold">
        Pack Up Stall
      </button>
    </ModalShell>
  );
}

function BrowseStallModal({ stall, myGold, near, onBuy, onClose }) {
  const tierCfg = STALL_TIERS[stall.tier - 1];
  const listings = Object.entries(stall.listings || {});
  return (
    <ModalShell title={`${stall.ownerName}'s ${tierCfg?.name || 'Stall'}`} iconSrc={tierCfg?.img} onClose={onClose}>
      <div className="flex items-center gap-2 mb-3 text-sm text-white/60">
        <img src={GOLD_ICON} alt="" className="w-4 h-4" /> You have {fmtQty(myGold)} gold
      </div>
      {listings.length === 0 && <div className="text-white/40 text-sm text-center py-6">This stall is empty right now.</div>}
      <div className="space-y-1.5">
        {listings.map(([itemId, l]) => (
          <div key={itemId} className="flex items-center gap-2 bg-white/5 rounded-xl px-2.5 py-2">
            {ITEMS[itemId]?.img && <img src={ITEMS[itemId].img} alt="" className="w-6 h-6" />}
            <div className="flex-1">
              <div className="text-sm font-semibold">{ITEMS[itemId]?.name}</div>
              <div className="text-xs text-white/50">{l.qty} left · {l.price} gold</div>
            </div>
            <button
              onClick={() => onBuy(itemId)}
              disabled={!near || l.qty <= 0 || myGold < l.price}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-white/40 px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
      {!near && <div className="text-amber-300 text-xs text-center mt-3">Walk closer to buy from this stall.</div>}
    </ModalShell>
  );
}

function ShopModal({ shop, myGold, myInv, near, onBuy, onDonate, onClose }) {
  const stock = shop?.stock || {};
  const task = shop?.task || null;
  const slots = Object.entries(stock);
  const allSoldOut = slots.length > 0 && slots.every(([, s]) => (s?.qty || 0) <= 0);
  return (
    <ModalShell title="The Wandering Merchant" iconSrc={MERCHANT_IMG} onClose={onClose}>
      <div className="flex items-center gap-2 mb-3 text-sm text-white/60">
        <img src={GOLD_ICON} alt="" className="w-4 h-4" /> You have {fmtQty(myGold)} gold
      </div>

      {allSoldOut && (
        <div className="bg-rose-500/15 border border-rose-400/30 text-rose-200 text-xs rounded-xl p-2.5 mb-3 text-center font-semibold">
          The caravan is picked clean! Complete the restock task below for fresh goods.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4">
        {slots.map(([slotId, s]) => {
          const item = ITEMS[s.itemId];
          const out = (s.qty || 0) <= 0;
          return (
            <div key={slotId} className={`rounded-xl border p-2.5 text-center ${out ? 'border-white/5 bg-white/[0.02] opacity-50' : 'border-white/10 bg-white/5'}`}>
              {item?.img && <img src={item.img} alt="" className="w-9 h-9 mx-auto object-contain" style={item.tint ? { filter: item.tint } : undefined} />}
              <div className="text-xs font-semibold mt-1 truncate">{item?.name || s.itemId}</div>
              <div className="text-[10px] text-white/50 mb-1.5">{out ? 'SOLD OUT' : `${s.qty} left · ${s.price} gold`}</div>
              <button
                onClick={() => onBuy(slotId)}
                disabled={!near || out || myGold < s.price}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-white/40 py-1.5 rounded-lg text-xs font-bold"
              >
                Buy
              </button>
            </div>
          );
        })}
        {slots.length === 0 && <div className="col-span-2 text-white/40 text-sm text-center py-6">The merchant is setting up shop…</div>}
      </div>

      {task && (
        <div className="bg-amber-500/10 border border-amber-400/25 rounded-2xl p-3">
          <div className="text-amber-300 font-bold text-sm mb-1">🎯 Class Restock Task</div>
          <div className="flex items-center gap-2 text-xs text-white/80 mb-2">
            {ITEMS[task.itemId]?.img && <img src={ITEMS[task.itemId].img} alt="" className="w-5 h-5" />}
            Bring the merchant <b>{task.need}× {ITEMS[task.itemId]?.name}</b> — everyone can chip in!
          </div>
          <div className="w-full bg-black/40 rounded-full h-3 border border-white/10 mb-2">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all" style={{ width: `${Math.min(100, Math.round(((task.have || 0) / task.need) * 100))}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/50">{task.have || 0}/{task.need} donated · you have {myInv[task.itemId] || 0}</span>
            <button
              onClick={onDonate}
              disabled={!near || (myInv[task.itemId] || 0) < 1}
              className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-white/40 text-amber-950 px-4 py-1.5 rounded-lg text-xs font-bold"
            >
              Donate 1
            </button>
          </div>
        </div>
      )}
      {!near && <div className="text-amber-300 text-xs text-center mt-3">Walk closer to the caravan to trade.</div>}
    </ModalShell>
  );
}

function QuestBoardModal({ quests, progressOf, claimed, near, treasureHintText, treasureDone, onClaim, onClose }) {
  return (
    <ModalShell title="Daily Quest Board" iconSrc={NOTICEBOARD_IMG} onClose={onClose}>
      <p className="text-white/50 text-xs text-center mb-3">New quests every day — the whole class gets the same three!</p>
      <div className="space-y-2 mb-4">
        {quests.map((q) => {
          const prog = Math.min(q.need, progressOf(q));
          const done = prog >= q.need;
          const isClaimed = claimed.includes(q.id);
          return (
            <div key={q.id} className={`rounded-xl border p-2.5 ${isClaimed ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}>
              <div className="flex items-center gap-2.5">
                <img src={q.img} alt="" className="w-8 h-8 object-contain" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{q.name}</div>
                  <div className="w-full bg-black/40 rounded-full h-2 mt-1 border border-white/10">
                    <div className={`h-full rounded-full transition-all ${done ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${Math.round((prog / q.need) * 100)}%` }} />
                  </div>
                  <div className="text-[10px] text-white/50 mt-0.5">{prog}/{q.need} · reward: {q.reward} gold</div>
                </div>
                {isClaimed ? (
                  <span className="text-emerald-400 text-xs font-bold">✓ Claimed</span>
                ) : (
                  <button
                    onClick={() => onClaim(q)}
                    disabled={!near || !done}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-white/40 px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-500/10 border border-amber-400/25 rounded-2xl p-3 flex items-center gap-3">
        <img src={TREASURE_MAP_IMG} alt="" className="w-10 h-10 object-contain" />
        <div className="text-xs text-white/80">
          <div className="font-bold text-amber-300 mb-0.5">🗺️ Today&apos;s Buried Treasure</div>
          {treasureDone
            ? <span className="text-emerald-300 font-semibold">You dug it up today — a fresh one is buried tomorrow!</span>
            : <span>An X is hidden <b>{treasureHintText}</b>. Walk around out there and it&apos;ll appear when you&apos;re close…</span>}
        </div>
      </div>
      {!near && <div className="text-amber-300 text-xs text-center mt-3">Walk closer to the notice board to claim rewards.</div>}
    </ModalShell>
  );
}

function FountainModal({ myGold, wishesUsed, near, result, onToss, onClose }) {
  const left = Math.max(0, WISHES_PER_DAY - wishesUsed);
  return (
    <ModalShell title="The Wishing Fountain" iconSrc={FOUNTAIN_IMG} onClose={onClose}>
      <img src={FOUNTAIN_IMG} alt="" className="w-24 h-24 mx-auto object-contain mb-2" />
      <p className="text-center text-white/60 text-sm mb-3">
        Toss a coin, make a wish… gold, Wild Essence, even soggy Recipe Scrolls have surfaced here.
      </p>
      <div className="flex items-center justify-center gap-4 text-sm text-white/70 mb-3">
        <span className="flex items-center gap-1.5"><img src={GOLD_ICON} alt="" className="w-4 h-4" /> {fmtQty(myGold)}</span>
        <span>✨ {left}/{WISHES_PER_DAY} wishes left today</span>
      </div>
      {result && (
        <div className={`text-center rounded-2xl p-3 mb-3 text-sm font-bold ${result.type === 'jackpot' ? 'bg-amber-400/20 text-amber-200 animate-pulse' : result.type === 'nothing' ? 'bg-white/5 text-white/60' : 'bg-emerald-500/15 text-emerald-300'}`}>
          {result.text}
        </div>
      )}
      <button
        onClick={onToss}
        disabled={!near || left <= 0 || myGold < WISH_COST}
        className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-white/40 py-3 rounded-xl font-bold"
      >
        🪙 Toss a Coin ({WISH_COST} gold)
      </button>
      {!near && <div className="text-amber-300 text-xs text-center mt-2">Walk closer to the fountain to make a wish.</div>}
    </ModalShell>
  );
}

function PlayerModal({ player, wins = 0, bestLap, near, onChallenge, onClose }) {
  return (
    <ModalShell title={player.name} icon="🙋" onClose={onClose}>
      <div className="flex flex-col items-center mb-3">
        <div className="relative">
          <img src={getAvatarImage(player.avatarBase, player.level)} alt="" className="w-16 h-16 rounded-full border-2 border-yellow-300 mb-2" />
          {player.companion && (
            <img src={player.companion.img} alt="" title={`Companion: ${player.companion.name}`}
              className="absolute -bottom-0 -right-2 w-7 h-7 rounded-full object-cover border border-white shadow"
              style={player.companion.shiny ? { filter: 'hue-rotate(45deg) saturate(1.7) brightness(1.05)' } : undefined} />
          )}
        </div>
        <div className="font-bold">{player.name}</div>
      </div>

      {/* Cross-game stat card */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-white/5 rounded-xl p-2" title="Champion's Forge weapon">
          {player.weaponImg ? (
            <>
              <img src={player.weaponImg} alt="" className="w-8 h-8 mx-auto object-contain" />
              <div className="text-[9px] text-white/60 truncate mt-0.5">{player.weaponName}</div>
            </>
          ) : (
            <div className="text-white/30 text-[10px] py-2">No Forge<br />weapon yet</div>
          )}
        </div>
        <div className="bg-white/5 rounded-xl p-2" title="Wildwood Prosperity">
          <div className="text-lg font-black text-emerald-400">{fmtQty(player.prosperity || 0)}</div>
          <div className="text-[9px] text-white/60">Prosperity</div>
        </div>
        <div className="bg-white/5 rounded-xl p-2" title="Duels won today / best lap">
          <div className="text-lg font-black text-amber-400">{wins}</div>
          <div className="text-[9px] text-white/60">wins today{bestLap ? ` · 🏁 ${(bestLap / 1000).toFixed(1)}s` : ''}</div>
        </div>
      </div>
      {near ? (
        <>
          <div className="text-xs text-white/50 text-center mb-2">Challenge to a duel:</div>
          <div className="grid grid-cols-2 gap-2">
            {MINIGAMES.map((g) => (
              <button key={g.id} onClick={() => onChallenge(g.id)} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-center">
                {g.iconImg ? (
                  <img src={g.iconImg} alt="" className="w-8 h-8 mx-auto mb-1 object-contain" />
                ) : (
                  <div className="text-2xl mb-1">{g.icon}</div>
                )}
                <div className="text-xs font-semibold">{g.name}</div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-amber-300 text-sm text-center py-4">Walk closer to {player.name} to challenge them!</div>
      )}
    </ModalShell>
  );
}

export default TownSquareGame;
