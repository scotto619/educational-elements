// scripts/migrate-my-account.mjs
// Targeted, FULL-FIDELITY, ADDITIVE migration for a single teacher account.
//
// What it does:
//   1. Finds your teacher user doc by email.
//   2. Writes a JSON backup of that user doc to backups/.
//   3. For each V1 class nested in users/<id>.classes[], creates the V2 docs:
//        - classes/<classId>
//        - class_memberships/<classId>
//        - students/<studentId>   (one per student)
//      ...copying EVERY field (passwords, pet eggs, points, etc.), not a whitelist.
//   4. Leaves your original V1 data (users/<id>.classes[]) COMPLETELY untouched.
//      Because login tries V2 first, the new V2 docs become the fast path while
//      V1 stays as an intact fallback. To undo, just delete the new V2 docs.
//
// Safety:
//   - DRY RUN by default. It only writes when you pass --commit.
//   - Refuses to overwrite an existing V2 class with the same classCode unless
//     you pass --force (prevents creating duplicates).
//
// Usage:
//   node scripts/migrate-my-account.mjs your@email.com            # dry run (no writes)
//   node scripts/migrate-my-account.mjs your@email.com --commit   # perform migration

import { config } from 'dotenv';
config({ path: '.env.local' });
import admin from 'firebase-admin';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
const TARGET_EMAIL = (args.find((a) => !a.startsWith('--')) || 'scotto6190@gmail.com').trim().toLowerCase();
const COMMIT = args.includes('--commit');
const FORCE = args.includes('--force');

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

const log = (...a) => console.log(...a);
const genId = (p) => `${p}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

async function main() {
  log(`\n${COMMIT ? '🚀 COMMIT MODE' : '🧪 DRY RUN (no writes)'} — account: ${TARGET_EMAIL}\n${'='.repeat(64)}`);

  // 1) Find user
  const userSnap = await db.collection('users').where('email', '==', TARGET_EMAIL).limit(1).get();
  if (userSnap.empty) { log('❌ No user with that email.'); return; }
  const userDoc = userSnap.docs[0];
  const userId = userDoc.id;
  const u = userDoc.data();
  const v1Classes = Array.isArray(u.classes) ? u.classes : [];
  log(`✅ user ${userId} — V1 classes: ${v1Classes.length}`);
  if (v1Classes.length === 0) { log('Nothing to migrate (no nested V1 classes). You may already be on V2.'); return; }

  // 2) Backup (always, even in dry run, so you have a snapshot)
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backups/account-${userId.substring(0, 8)}-${ts}`;
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(join(backupDir, 'user-doc.json'), JSON.stringify({ id: userId, ...u }, null, 2));
  log(`💾 Backup written: ${backupDir}/user-doc.json`);

  // 3) Plan + (optionally) write each class
  for (const cls of v1Classes) {
    const code = (cls.classCode || '').toUpperCase();
    const classId = cls.id || cls.classId || genId('class');
    const students = Array.isArray(cls.students) ? cls.students : [];
    log(`\n📘 Class "${cls.name || 'Untitled'}" code=${code} → classes/${classId} (${students.length} students)`);

    // Collision check
    if (code) {
      const existing = await db.collection('classes').where('classCode', '==', code).get();
      const conflicts = existing.docs.filter((d) => d.id !== classId);
      if (existing.size > 0 && !FORCE) {
        log(`   ⚠️  A V2 class with code ${code} already exists (${existing.size}). Skipping to avoid duplicates. Use --force to override.`);
        continue;
      }
      if (conflicts.length) log(`   ⚠️  --force: proceeding despite ${conflicts.length} other V2 class(es) with this code.`);
    }

    const studentIds = [];
    for (const s of students) {
      const sid = s.id || s.studentId || genId('student');
      studentIds.push(sid);
      const studentData = { ...s, id: sid, classId, archived: s.archived ?? false, updatedAt: new Date().toISOString() };
      if (!s.id) log(`   • student "${s.firstName || '?'}" had no id → generated ${sid}`);
      else log(`   • student "${s.firstName || '?'}" → students/${sid} (fields: ${Object.keys(s).length}, pwHash: ${s.simplePasswordHash ? 'yes' : 'no'})`);
      if (COMMIT) await db.collection('students').doc(sid).set(studentData, { merge: true });
    }

    const { students: _omit, ...classRest } = cls; // store roster separately, keep all other class fields
    const classDoc = {
      ...classRest,
      id: classId,
      teacherId: u.teacherId || userId,
      classCode: code || cls.classCode,
      studentCount: studentIds.length,
      archived: cls.archived ?? false,
      updatedAt: new Date().toISOString(),
    };
    const membershipDoc = {
      classId,
      teacherId: userId,
      students: studentIds,
      updatedAt: new Date().toISOString(),
    };

    if (COMMIT) {
      await db.collection('classes').doc(classId).set(classDoc, { merge: true });
      await db.collection('class_memberships').doc(classId).set(membershipDoc, { merge: true });
      log(`   ✅ wrote classes/${classId} + class_memberships/${classId} (${studentIds.length} students)`);
    } else {
      log(`   (dry run) would write classes/${classId} + class_memberships/${classId} + ${studentIds.length} student docs`);
    }
  }

  log(`\n${'='.repeat(64)}`);
  if (COMMIT) log('✅ Migration committed. Your V1 data is untouched. Test a student login, then you can remove the V1 fallback later if you like.');
  else log('🧪 Dry run complete. No data changed. Re-run with --commit to apply.');
}

main().then(() => process.exit(0)).catch((e) => { console.error('Error:', e); process.exit(1); });
