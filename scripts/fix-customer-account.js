// scripts/fix-customer-account.js
//
// Repairs a paying customer's account when their Stripe subscription never got
// written to their Firestore user document (the "I paid but it tells me to
// sign up" bug).
//
// Usage (run from the project root on your own computer):
//
//   node scripts/fix-customer-account.js customer@email.com          <- dry run (shows what it found, changes nothing)
//   node scripts/fix-customer-account.js customer@email.com --apply  <- actually fixes the account
//
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const Stripe = require('stripe');

const email = (process.argv[2] || '').trim().toLowerCase();
const apply = process.argv.includes('--apply');

if (!email || !email.includes('@')) {
  console.log('Usage: node scripts/fix-customer-account.js customer@email.com [--apply]');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});
const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 20000, maxNetworkRetries: 1 });

(async () => {
  console.log(`\n🔎 Repairing account for: ${email} ${apply ? '(APPLY MODE)' : '(dry run)'}\n`);

  // ── 1. Find the Firebase Auth user ─────────────────────────────────────────
  let authUser = null;
  try {
    authUser = await admin.auth().getUserByEmail(email);
    console.log(`✅ Firebase Auth user found: uid=${authUser.uid} (created ${authUser.metadata.creationTime})`);
  } catch (e) {
    console.log(`❌ No Firebase Auth user with that email (${e.code}).`);
    console.log('   → Ask the customer exactly which email they LOG IN with — it may differ from the one they paid with.');
  }

  // ── 2. Look at their Firestore user doc ─────────────────────────────────────
  let userDoc = null;
  if (authUser) {
    userDoc = await db.collection('users').doc(authUser.uid).get();
    if (userDoc.exists) {
      const u = userDoc.data();
      console.log('✅ Firestore user doc exists. Current subscription fields:');
      console.log(`   subscription=${u.subscription} | subscriptionStatus=${u.subscriptionStatus} | stripeCustomerId=${u.stripeCustomerId || 'none'} | accountStatus=${u.accountStatus || '-'}`);
    } else {
      console.log('⚠️ Firestore user doc is MISSING (signup write never completed). It will be created on --apply.');
    }
  }

  // ── 3. Find the Stripe customer ─────────────────────────────────────────────
  let customer = null;

  const byEmail = await stripe.customers.list({ email, limit: 3 });
  if (byEmail.data.length) {
    customer = byEmail.data[0];
    console.log(`✅ Stripe customer found by email: ${customer.id}`);
  }

  if (!customer && authUser) {
    try {
      const found = await stripe.customers.search({
        query: `metadata['firebaseUserId']:'${authUser.uid}'`,
        limit: 1,
      });
      if (found.data.length) {
        customer = found.data[0];
        console.log(`✅ Stripe customer found via firebaseUserId metadata: ${customer.id} (email on Stripe: ${customer.email})`);
      }
    } catch (e) {
      console.log(`   (metadata search unavailable: ${e.message})`);
    }
  }

  if (!customer) {
    // Last resort: scan recent checkout sessions for this email
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    const match = sessions.data.find(
      (s) => (s.customer_details?.email || s.customer_email || '').toLowerCase() === email
    );
    if (match && match.customer) {
      customer = await stripe.customers.retrieve(match.customer);
      console.log(`✅ Stripe customer found via recent checkout session: ${customer.id}`);
    }
  }

  if (!customer) {
    console.log('❌ No Stripe customer found for that email.');
    console.log('   → Check the Stripe dashboard for the payment and note the email on the payment;');
    console.log('     then re-run this script with THAT email, or run it with the login email once you know the uid matches.');
    process.exit(1);
  }

  // ── 4. Find their subscription ──────────────────────────────────────────────
  const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'all', limit: 10 });
  if (!subs.data.length) {
    console.log('❌ Stripe customer has NO subscriptions at all. Nothing to link.');
    process.exit(1);
  }

  const best =
    subs.data.find((s) => ['active', 'trialing'].includes(s.status)) ||
    subs.data.sort((a, b) => b.created - a.created)[0];

  console.log(`✅ Subscription: ${best.id} | status=${best.status} | period ends ${new Date(best.current_period_end * 1000).toISOString().slice(0, 10)}`);

  if (!['active', 'trialing'].includes(best.status)) {
    console.log(`⚠️ NOTE: subscription status is "${best.status}" — linking it will not grant access unless it becomes active.`);
  }

  if (!authUser) {
    console.log('\n❌ Cannot write the fix without a Firebase Auth user. Resolve the email mismatch first (see above).');
    process.exit(1);
  }

  // ── 5. Apply ────────────────────────────────────────────────────────────────
  const fix = {
    email,
    stripeCustomerId: customer.id,
    subscription: ['active', 'trialing'].includes(best.status) ? 'educational-elements' : 'cancelled',
    subscriptionId: best.id,
    subscriptionStatus: best.status,
    planType: 'educational-elements',
    currentPeriodEnd: new Date(best.current_period_end * 1000),
    updatedAt: new Date().toISOString(),
  };

  // If the doc is missing entirely, include the signup defaults so the app works
  if (!userDoc || !userDoc.exists) {
    fix.createdAt = new Date().toISOString();
    fix.classes = [];
    fix.version = '2.0';
  }

  console.log('\n📝 Fields that will be written to users/' + authUser.uid + ':');
  console.log(JSON.stringify(fix, null, 2));

  if (!apply) {
    console.log('\nDry run complete — nothing was changed. Re-run with --apply to fix the account.');
  } else {
    await db.collection('users').doc(authUser.uid).set(fix, { merge: true });
    console.log('\n✅ DONE. The customer can now log in normally. Ask her to try again (no need to clear anything).');
  }
  process.exit(0);
})().catch((e) => {
  console.error('Script failed:', e);
  process.exit(1);
});
