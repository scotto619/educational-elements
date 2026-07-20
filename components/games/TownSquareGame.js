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
import { ITEMS, GOLD_ICON, fmtQty } from './Homestead/homesteadConfig';
import {
  PLOTS, STALL_TIERS, STALL_THEMES, MINIGAMES, MINIGAME_MAP, ringColorFor,
  canAfford, deductCost, fmtCost, DECOR, NETWORK_RATE, CHAT_BUBBLE_MS,
  INTERACT_RADIUS, WORLD_W, WORLD_H, MARGIN, MOVE_SPEED, CAMERA_LERP, EMPTY_PLOT_IMG,
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

  const getMeInfo = useCallback(() => ({
    id: myIdRef.current,
    name: myName,
    avatarBase: studentData?.avatarBase || 'Wizard F',
    level: myLevel,
    ring: ringColorFor(myIdRef.current),
  }), [myName, studentData?.avatarBase, myLevel]);

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
    onChildAdded(playersPath, (snap) => { if (snap.key !== myId) remotePlayersStoreRef.current[snap.key] = snap.val(); });
    onChildChanged(playersPath, (snap) => {
      if (snap.key === myId) return;
      remotePlayersStoreRef.current[snap.key] = { ...remotePlayersStoreRef.current[snap.key], ...snap.val() };
    });
    onChildRemoved(playersPath, (snap) => { delete remotePlayersStoreRef.current[snap.key]; });

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
    setupListeners(code, myId);

    if (localTownSquareRef.current.stall) syncStallToRTDB(localTownSquareRef.current.stall);

    networkIntervalRef.current = setInterval(() => {
      if (!myPlayerDbRef.current) return;
      update(myPlayerDbRef.current, { x: Math.round(myPosRef.current.x), y: Math.round(myPosRef.current.y), updatedAt: Date.now() }).catch(() => {});
    }, NETWORK_RATE);

    flushIntervalRef.current = setInterval(() => {
      setRemotePlayers({ ...remotePlayersStoreRef.current });
      forceTick((n) => n + 1);
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
    push(ref(database, `worldRooms/${roomCodeRef.current}/chat`), { pid: myIdRef.current, name: myName, text, at: Date.now() }).catch(() => {});
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
    setActiveModal(null);
    forceTick((n) => n + 1);
  }, [myStall, saveBoth, syncStallToRTDB, showToast]);

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
      forceTick((n) => n + 1);
    } catch {
      showToast?.('Purchase failed — try again.', 'error');
    }
  }, [stalls, myName, saveHomestead, showToast]);

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
            background: `radial-gradient(circle at 50% 50%, #d6b370 0%, #c2a05e 22%, #a9884d 45%, #7f6b3a 70%, #5d4f2c 100%)`,
            willChange: 'transform',
            transform: `translate3d(${-cameraRef.current.x}px, ${-cameraRef.current.y}px, 0)`,
          }}
        >
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
          {Object.entries(remotePlayers).map(([id, p]) => (
            <button
              key={id}
              onClick={() => setActiveModal({ type: 'player', id, name: p.name, x: p.x, y: p.y, avatarBase: p.avatarBase, level: p.level })}
              className="absolute flex flex-col items-center z-20"
              style={{ left: p.x, top: p.y, transition: 'left 0.15s linear, top 0.15s linear', transform: 'translate(-50%,-50%)' }}
            >
              {p.bubble && p.bubble.expiresAt > now && (
                <div className="bg-white text-slate-800 text-xs rounded-xl px-2 py-1 mb-1 shadow max-w-[110px] truncate">{p.bubble.text}</div>
              )}
              <img src={getAvatarImage(p.avatarBase, p.level)} alt="" className="w-10 h-10 rounded-full border-2 shadow-lg bg-white/80" style={{ borderColor: p.ring || '#fff' }} />
              <div className="text-[10px] font-bold text-white bg-black/55 rounded px-1.5 mt-0.5 max-w-[80px] truncate">{p.name}</div>
            </button>
          ))}

          {/* Me */}
          <div ref={avatarDivRef} className="absolute flex flex-col items-center z-20 pointer-events-none" style={{ left: myPosRef.current.x, top: myPosRef.current.y, transform: 'translate(-50%,-50%)' }}>
            {myBubble && myBubble.expiresAt > now && (
              <div className="bg-yellow-300 text-slate-900 text-xs rounded-xl px-2 py-1 mb-1 shadow max-w-[110px] truncate">{myBubble.text}</div>
            )}
            <img src={myAvatarSrc} alt="" className="w-11 h-11 rounded-full border-2 border-yellow-300 shadow-xl bg-white/80" />
            <div className="text-[10px] font-bold text-white bg-black/65 rounded px-1.5 mt-0.5">{myName}</div>
          </div>
        </div>
      </div>

      {/* Chat panel */}
      {chatOpen && (
        <div className="absolute top-14 right-3 z-30 w-64 max-h-56 bg-black/55 backdrop-blur-md rounded-2xl border border-white/10 p-2 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-1 mb-1 pr-1">
            {chatLog.length === 0 && <div className="text-white/40 text-xs text-center py-4">No messages yet — say hi!</div>}
            {chatLog.map((m) => (
              <div key={m.id} className="text-xs text-white/90"><span className="font-bold text-yellow-300">{m.name}:</span> {m.text}</div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}

      {/* Chat input */}
      <form onSubmit={sendChat} className={`absolute bottom-3 left-3 z-30 flex gap-2 ${isTouchDevice ? 'right-[190px]' : 'right-24'}`}>
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
          near={isNear(activeModal)}
          onChallenge={(gameId) => sendChallenge(activeModal.id, activeModal.name, gameId)}
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

function PlayerModal({ player, near, onChallenge, onClose }) {
  return (
    <ModalShell title={player.name} icon="🙋" onClose={onClose}>
      <div className="flex flex-col items-center mb-4">
        <img src={getAvatarImage(player.avatarBase, player.level)} alt="" className="w-16 h-16 rounded-full border-2 border-yellow-300 mb-2" />
        <div className="font-bold">{player.name}</div>
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
