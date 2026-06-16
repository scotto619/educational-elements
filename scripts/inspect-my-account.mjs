// scripts/inspect-my-account.mjs
// READ-ONLY. Inspects a single teacher account by email.
// Confirms whether their class data is V1 (nested in users doc) or V2
// (classes/students/class_memberships collections), with no writes.
import { config } from 'dotenv';
config({ path: '.env.local' });
import admin from 'firebase-admin';

const TARGET_EMAIL = (process.argv[2] || 'scotto6190@gmail.com').trim().toLowerCase();

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


function studentFieldSummary(students) {
  const keys = new Set();
  let withPwHash = 0, withEggs = 0;
  for (const s of students) {
    Object.keys(s || {}).forEach((k) => keys.add(k));
    if (s && s.simplePasswordHash) withPwHash++;
    if (s && Array.isArray(s.petEggs) && s.petEggs.length) withEggs++;
  }
  return { keys: [...keys].sort(), withPwHash, withEggs };
}

async function main() {
  console.log(`\n🔍 READ-ONLY inspection for: ${TARGET_EMAIL}\n${'='.repeat(60)}`);

  // 1) Find the user doc by email
  const userSnap = await db.collection('users').where('email', '==', TARGET_EMAIL).limit(1).get();
  if (userSnap.empty) {
    console.log('❌ No user document found with that email.');
    return;
  }
  const userDoc = userSnap.docs[0];
  const userId = userDoc.id;
  const u = userDoc.data();
  console.log(`✅ Found user doc: ${userId}`);
  console.log(`   version field: ${u.version || '(none)'}   migratedFrom: ${u.migratedFrom || '(none)'}`);
  console.log(`   has nested classes[] (V1 shape): ${Array.isArray(u.classes) ? `YES (${u.classes.length})` : 'no'}`);

  // 2) Summarize V1 nested classes
  const v1Codes = [];
  if (Array.isArray(u.classes)) {
    console.log(`\n--- V1 (nested in user doc) ---`);
    for (const cls of u.classes) {
      const students = Array.isArray(cls.students) ? cls.students : [];
      v1Codes.push((cls.classCode || '').toUpperCase());
      const fs = studentFieldSummary(students);
      console.log(`   • "${cls.name || 'Untitled'}"  code=${cls.classCode}  id=${cls.id || '(none)'}  students=${students.length}`);
      console.log(`       students w/ custom password hash: ${fs.withPwHash}/${students.length}`);
      console.log(`       students w/ pet eggs: ${fs.withEggs}/${students.length}`);
      console.log(`       student fields present: ${fs.keys.join(', ') || '(none)'}`);
    }
  }

  // 3) Check V2 for the same teacher
  console.log(`\n--- V2 (collections) for this teacher ---`);
  const v2ClassesSnap = await db.collection('classes').where('teacherId', '==', userId).get();
  console.log(`   classes docs with teacherId=${userId}: ${v2ClassesSnap.size}`);
  for (const c of v2ClassesSnap.docs) {
    const cd = c.data();
    const memb = await db.collection('class_memberships').doc(c.id).get();
    const ids = memb.exists ? (memb.data().students || []) : [];
    console.log(`   • classes/${c.id}  code=${cd.classCode}  name="${cd.name}"  membershipStudents=${ids.length}`);
  }

  // 4) For each V1 class code, does a V2 class already exist? (collision check)
  if (v1Codes.length) {
    console.log(`\n--- V2 collision check by classCode ---`);
    for (const code of v1Codes) {
      if (!code) continue;
      const hit = await db.collection('classes').where('classCode', '==', code).get();
      console.log(`   code ${code}: ${hit.size} existing V2 class doc(s)`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('Done. No data was modified.');
}

main().then(() => process.exit(0)).catch((e) => { console.error("Error:", e); process.exit(1); });
