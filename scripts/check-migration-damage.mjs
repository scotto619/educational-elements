// scripts/check-migration-damage.mjs
// READ-ONLY. Assesses whether the accidental `migrate --commit` run touched any
// live student documents. No writes.
//
// It compares the IDs in the stale V1 nested class against your live V2 classes,
// and reports which student docs the migration script created/modified.
//
// Usage: node scripts/check-migration-damage.mjs scotto6190@gmail.com
import { config } from 'dotenv';
config({ path: '.env.local' });
import admin from 'firebase-admin';

const TARGET_EMAIL = (process.argv[2] || 'scotto6190@gmail.com').trim().toLowerCase();
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (the day --commit ran)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

async function main() {
  console.log(`\n🔍 READ-ONLY damage check for: ${TARGET_EMAIL}  (commit day assumed: ${TODAY})\n${'='.repeat(66)}`);

  const userSnap = await db.collection('users').where('email', '==', TARGET_EMAIL).limit(1).get();
  if (userSnap.empty) { console.log('❌ No user found.'); return; }
  const userId = userSnap.docs[0].id;
  const u = userSnap.docs[0].data();

  // V1 nested student IDs (the source the migration wrote FROM)
  const v1 = (Array.isArray(u.classes) ? u.classes : []).flatMap((c) =>
    (Array.isArray(c.students) ? c.students : []).map((s) => ({ id: s.id || s.studentId, srcClassId: c.id || c.classId, code: c.classCode })));
  const v1Ids = v1.map((x) => x.id).filter(Boolean);
  console.log(`V1 nested students: ${v1Ids.length}`);

  // Live V2 classes + memberships → map studentId -> realClassId
  const v2ClassesSnap = await db.collection('classes').where('teacherId', '==', userId).get();
  const v2StudentToClass = new Map();
  for (const c of v2ClassesSnap.docs) {
    const memb = await db.collection('class_memberships').doc(c.id).get();
    const ids = memb.exists ? (memb.data().students || []) : [];
    ids.forEach((sid) => v2StudentToClass.set(sid, { classId: c.id, code: c.data().classCode, name: c.data().name }));
  }
  console.log(`Live V2 classes: ${v2ClassesSnap.size}, total V2 members: ${v2StudentToClass.size}`);

  // Overlap = V1 ids that are ALSO real members of a live V2 class
  const overlap = v1Ids.filter((id) => v2StudentToClass.has(id));
  console.log(`\nOverlap (V1 ids that are also live V2 members): ${overlap.length}`);

  // Inspect each V1 id's current student doc
  let created = 0, clobbered = 0, untouched = 0, missing = 0;
  const bad = [];
  for (const id of v1Ids) {
    const snap = await db.collection('students').doc(id).get();
    if (!snap.exists) { missing++; continue; }
    const d = snap.data();
    const writtenByUs = (d.updatedAt || '').slice(0, 10) === TODAY && d.classId === (v1.find((x) => x.id === id)?.srcClassId);
    const isLiveMember = v2StudentToClass.has(id);
    if (writtenByUs && isLiveMember) {
      clobbered++;
      const real = v2StudentToClass.get(id);
      bad.push({ id, name: `${d.firstName || ''} ${d.lastName || ''}`.trim(), nowClassId: d.classId, shouldBeClassId: real.classId, shouldBeCode: real.code });
    } else if (writtenByUs && !isLiveMember) {
      created++;
    } else {
      untouched++;
    }
  }

  console.log(`\n--- Per-student status (from the ${v1Ids.length} V1 ids) ---`);
  console.log(`  🟢 orphan docs created by the script (safe to delete): ${created}`);
  console.log(`  🔴 LIVE students whose classId was changed by the script: ${clobbered}`);
  console.log(`  ⚪ untouched / not written by the script: ${untouched}`);
  console.log(`  ⚫ id not present in students collection: ${missing}`);

  if (bad.length) {
    console.log(`\n⚠️  Live students affected (classId needs restoring, and point values may be stale):`);
    bad.forEach((b) => console.log(`   • ${b.id} (${b.name}) classId is now "${b.nowClassId}", should be "${b.shouldBeClassId}" (${b.shouldBeCode})`));
  }

  // Did a bad class doc get created?
  for (const x of v1) {
    if (!x.srcClassId) continue;
    const c = await db.collection('classes').doc(x.srcClassId).get();
    console.log(`\nStale-class doc classes/${x.srcClassId}: ${c.exists ? 'EXISTS' : 'does not exist (good — class write failed as expected)'}`);
    break;
  }

  console.log(`\n${'='.repeat(66)}\nDone. No data was modified.`);
  if (clobbered === 0) console.log('✅ No live students were corrupted. Cleanup, if any, is just deleting orphan docs.');
  else console.log('❗ Some live students were modified. We will restore them carefully (see next step).');
}

main().then(() => process.exit(0)).catch((e) => { console.error('Error:', e); process.exit(1); });
