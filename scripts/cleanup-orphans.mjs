// scripts/cleanup-orphans.mjs
// Deletes ONLY the orphan student docs created by the accidental migrate --commit.
//
// Self-verifying: for each student id in the stale V1 nested class, it deletes the
// students/<id> doc ONLY IF all of these are true:
//   - the doc's classId === the stale class id (class-1764197804243)
//   - the id is NOT a member of any live V2 class (class_memberships)
// This makes it impossible to delete a real, in-use student.
//
// DRY RUN by default. Pass --commit to actually delete.
// Usage:
//   node scripts/cleanup-orphans.mjs scotto6190@gmail.com            # preview
//   node scripts/cleanup-orphans.mjs scotto6190@gmail.com --commit   # delete
import { config } from 'dotenv';
config({ path: '.env.local' });
import admin from 'firebase-admin';

const args = process.argv.slice(2);
const TARGET_EMAIL = (args.find((a) => !a.startsWith('--')) || 'scotto6190@gmail.com').trim().toLowerCase();
const COMMIT = args.includes('--commit');

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
  console.log(`\n${COMMIT ? '🗑️  DELETE MODE' : '🧪 DRY RUN (no deletes)'} — ${TARGET_EMAIL}\n${'='.repeat(60)}`);

  const userSnap = await db.collection('users').where('email', '==', TARGET_EMAIL).limit(1).get();
  if (userSnap.empty) { console.log('❌ No user found.'); return; }
  const userId = userSnap.docs[0].id;
  const u = userSnap.docs[0].data();

  // Stale V1 nested students + their source class id
  const v1 = (Array.isArray(u.classes) ? u.classes : []).flatMap((c) =>
    (Array.isArray(c.students) ? c.students : []).map((s) => ({ id: s.id || s.studentId, srcClassId: c.id || c.classId })));

  // Build set of all live V2 member ids
  const v2ClassesSnap = await db.collection('classes').where('teacherId', '==', userId).get();
  const liveMemberIds = new Set();
  for (const c of v2ClassesSnap.docs) {
    const memb = await db.collection('class_memberships').doc(c.id).get();
    (memb.exists ? (memb.data().students || []) : []).forEach((id) => liveMemberIds.add(id));
  }

  let deleted = 0, skipped = 0;
  for (const { id, srcClassId } of v1) {
    if (!id) continue;
    const ref = db.collection('students').doc(id);
    const snap = await ref.get();
    if (!snap.exists) { console.log(`  · ${id}: not present, skip`); skipped++; continue; }
    const d = snap.data();
    const safe = d.classId === srcClassId && !liveMemberIds.has(id);
    if (!safe) { console.log(`  ⚠️  ${id} (${d.firstName || '?'}): NOT an orphan (classId=${d.classId}, liveMember=${liveMemberIds.has(id)}) — KEEPING`); skipped++; continue; }
    if (COMMIT) { await ref.delete(); console.log(`  🗑️  deleted students/${id} (${d.firstName || '?'})`); }
    else console.log(`  (dry run) would delete students/${id} (${d.firstName || '?'})`);
    deleted++;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`${COMMIT ? 'Deleted' : 'Would delete'}: ${deleted}   |   Kept/skipped: ${skipped}`);
  if (!COMMIT) console.log('Re-run with --commit to delete.');
}

main().then(() => process.exit(0)).catch((e) => { console.error('Error:', e); process.exit(1); });
