// pages/api/chess-tournament.js
// Handles all Chess tournament WRITE operations via Firebase Admin SDK,
// bypassing client-side security rules that block the chess_tournaments path.

import admin from 'firebase-admin';

// ── Get (or lazily initialise) a named admin app that includes databaseURL ──
function getAdminApp() {
  const APP_NAME = 'chess-rtdb';
  try {
    return admin.app(APP_NAME); // already initialised
  } catch {
    // Not yet initialised — create it now
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PROJECT_ID) {
      throw new Error('Missing Firebase Admin SDK environment variables');
    }

    const databaseURL =
      process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
      process.env.FIREBASE_DATABASE_URL ||
      `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}-default-rtdb.firebaseio.com`;

    return admin.initializeApp(
      {
        credential: admin.credential.cert({
          projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey,
        }),
        databaseURL,
      },
      APP_NAME
    );
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const app = getAdminApp();
    const db  = admin.database(app);

    const { action, ...params } = req.body || {};

    switch (action) {

      // ── Create a new tournament ──────────────────────────────────────────
      case 'create': {
        const { code, hostId, hostName } = params;
        if (!code || !hostId) return res.status(400).json({ error: 'Missing code or hostId' });

        await db.ref(`chess_tournaments/${code}`).set({
          code,
          hostId,
          status:      'registering',
          createdAt:   Date.now(),
          players:     { [hostId]: { id: hostId, name: hostName || 'Host' } },
          playerOrder: [hostId],
          rounds:      [],
          currentRound: 0,
          winner:      null,
        });

        return res.status(200).json({ success: true });
      }

      // ── Join an existing tournament ──────────────────────────────────────
      case 'join': {
        const { code, userId, userName } = params;
        if (!code || !userId) return res.status(400).json({ error: 'Missing code or userId' });

        const snap = await db.ref(`chess_tournaments/${code}`).once('value');
        const data = snap.val();

        if (!data)                       return res.status(404).json({ error: 'Tournament not found' });
        if (data.status !== 'registering') return res.status(400).json({ error: 'Tournament already started' });

        const curPO = data.playerOrder || [];
        if (curPO.includes(userId)) {
          return res.status(200).json({ success: true, alreadyJoined: true, data });
        }

        await db.ref(`chess_tournaments/${code}`).update({
          [`players/${userId}`]: { id: userId, name: userName || 'Player' },
          playerOrder: [...curPO, userId],
        });

        return res.status(200).json({ success: true, data });
      }

      // ── Start tournament (host only) — write initial bracket ────────────
      case 'start': {
        const { code, rounds } = params;
        if (!code || !rounds) return res.status(400).json({ error: 'Missing code or rounds' });

        await db.ref(`chess_tournaments/${code}`).update({
          status:       'playing',
          rounds,
          currentRound: 0,
        });

        return res.status(200).json({ success: true });
      }

      // ── Write a chess game-code onto a match (host creates game room) ────
      case 'set_match_game': {
        const { code, roundIdx, matchIdx, gameCode } = params;
        if (code === undefined || roundIdx === undefined || matchIdx === undefined || !gameCode) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        await db.ref(`chess_tournaments/${code}/rounds/${roundIdx}/${matchIdx}`).update({
          gameCode,
          status: 'in_progress',
        });

        return res.status(200).json({ success: true });
      }

      // ── Record match result and (if round complete) advance bracket ──────
      case 'update_match': {
        const { code, roundIdx, matchIdx, winnerId, isDraw } = params;
        if (code === undefined || roundIdx === undefined || matchIdx === undefined) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const matchRef = db.ref(`chess_tournaments/${code}/rounds/${roundIdx}/${matchIdx}`);
        const mSnap    = await matchRef.once('value');
        const match    = mSnap.val();

        if (!match || match.status === 'finished') {
          return res.status(200).json({ success: true, alreadyFinished: true });
        }

        await matchRef.update({
          status:   'finished',
          winnerId: isDraw ? null : winnerId,
          isDraw:   !!isDraw,
        });

        // Check whether the whole round is now done
        const tRef  = db.ref(`chess_tournaments/${code}`);
        const tSnap = await tRef.once('value');
        const tData = tSnap.val();
        if (!tData) return res.status(200).json({ success: true });

        const thisRound = tData.rounds[roundIdx];
        const allDone   = thisRound.every((m, i) =>
          i === matchIdx ? true : m.status === 'finished'
        );
        if (!allDone) return res.status(200).json({ success: true });

        // Collect winners (null = draw)
        const winners = thisRound.map((m, i) => {
          if (i === matchIdx) return isDraw ? null : winnerId;
          return m.isDraw ? null : m.winnerId;
        }).filter(Boolean);

        const allPlayers = thisRound.flatMap(m => [m.p1Id, m.p2Id].filter(Boolean));
        const advanced   = winners.length ? winners : allPlayers; // fallback if all draws

        if (advanced.length === 1) {
          // Tournament over
          await tRef.update({ status: 'finished', winner: advanced[0], currentRound: roundIdx + 1 });
        } else {
          // Build next round bracket
          const next = [];
          for (let i = 0; i < advanced.length; i += 2) {
            const p2 = advanced[i + 1] || null;
            next.push({
              p1Id:     advanced[i],
              p2Id:     p2,
              winnerId: p2 ? null : advanced[i],   // auto-bye
              status:   p2 ? 'pending' : 'finished',
              gameCode: null,
              isDraw:   false,
            });
          }
          await tRef.update({
            [`rounds/${roundIdx + 1}`]: next,
            currentRound: roundIdx + 1,
          });
        }

        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('chess-tournament API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
