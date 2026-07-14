# Site Issues — Findings & Fixes (14 July 2026)

## Issue 1: Customer paid but login sends her to the signup page

### What's happening
Her Firebase login itself works. But her Firestore user document has no subscription fields, so the login code tries `/api/sync-stripe-subscription` to self-heal — and **that endpoint timed out at 300 seconds, 8 times today** (confirmed in the Vercel logs between 12:18pm–1:33pm AEST). When the sync fails or finds nothing, login redirects to `/checkout` — the "Start for $1" page she screenshotted.

### Root causes found in the code
1. **`stripe-webhook.js` used `.update()` on the user doc.** `update()` throws if the document doesn't exist or something went wrong at signup — so her payment succeeded in Stripe but was never written to Firebase. Your "payment took a while to come through" observation fits Stripe retrying a failing webhook.
2. **Delayed payments were dropped.** The webhook only looked for an *active* subscription at `checkout.session.completed` time. With a slow/async payment, there's no active subscription yet, and the handler silently gave up.
3. **The sync endpoint had no timeouts** (could hang 5 minutes) and only matched Stripe customers by email — if she paid using a different email than her login email, it finds nothing.

### Fixed in code (deploy to take effect)
- `pages/api/stripe-webhook.js` — all writes now `set(..., { merge: true })` (creates/repairs the doc instead of throwing); falls back to any-status subscription; records the Stripe customer ID even when no subscription is found yet.
- `pages/api/sync-stripe-subscription.js` — 10s Stripe timeout + 30s function cap (no more 5-minute hangs); also finds the customer by `firebaseUserId` metadata when the email doesn't match; `set + merge`.
- `pages/login.js` — sync call aborts after 15s so login can never freeze.

### Fix her account right now
On your computer, in the project folder:

```
node scripts/fix-customer-account.js her@email.com          (dry run — shows what it finds)
node scripts/fix-customer-account.js her@email.com --apply  (writes the fix)
```

Use the email she logs in with. If Stripe has a different email, the script tells you and explains what to do. After `--apply`, she can log in immediately.

## Issue 2: Classroom-wide failures (slow loading, game saves, coins, mystery box, loot well)

### Key insight
All of those features write **directly from the browser to Firestore** — they never touch your Vercel server. So when they all fail at once, the problem is at the Firebase project level, not one feature. The prime suspect is **Firestore quota/limits being hit while your class was using the site**.

**Check this first:** [Firebase Console](https://console.firebase.google.com) → your project → Firestore → **Usage** tab.
- If you're on the free **Spark** plan: the free tier is 50K reads / 20K writes per day. A whole class on the portal (roster loads, Champion's Forge autosaving every 25s per student, notice-board polling — 866 hits in the last 24h) can burn through that mid-day. Once exhausted, **every** read/write fails until the daily reset → exactly today's symptoms: stuck loading, saves failing, coins not appearing.
- Fix: upgrade to the **Blaze** plan (pay-as-you-go; at your scale likely a few dollars a month). This is the single most likely fix for today's classroom meltdown.

### Password updates failing — a real bug, now fixed
`pages/api/update-student-password.js` called `classDoc.exists()` — in the server SDK `exists` is a property, not a function, so **every V2 password update crashed**, silently fell back to scanning your entire `users` collection (slow + expensive, worsening the quota problem), then returned "Student not found". Fixed. The same bug existed in `class-data-v2.js` and `create-student-v2.js` — also fixed.

### Also fixed
- `pages/api/award-xp-v2.js` was missing an import **and** its default export — it errored for every caller.

## What to do, in order

1. **Check Firebase Console → Usage** (and plan). Upgrade to Blaze if you're on Spark.
2. **Deploy the code fixes**: review the diff, then commit & push to `main` (Vercel auto-deploys).
3. **Run the repair script** for your customer (above), then email her to try again.
4. Test a student password change from the dashboard — it should work after deploy.

## Worth doing soon (not done today — say the word and I'll implement)

- Several APIs still fall back to downloading the **entire `users` collection** (`verify-student-password.js`, `bulk-update-passwords.js`, `student-update-v2.js`). Massive read amplification. If all your classes are V2 now, those fallbacks can be removed.
- The notice board is polled heavily (866 requests/day). A longer poll interval or a realtime listener would cut costs.
- Champion's Forge autosaves each student's full save-blob every 25s — fine on Blaze, but the interval could be relaxed to 60s+.
