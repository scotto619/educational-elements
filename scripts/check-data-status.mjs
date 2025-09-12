import { config } from 'dotenv';
config({ path: '.env.local' });
import admin from 'firebase-admin';

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

async function checkStatus() {
  console.log('🔍 Checking current data status...\n');
  
  // Check V1 data
  const usersSnapshot = await db.collection('users').get();
  console.log(`V1 Users: ${usersSnapshot.size}`);
  
  let v1Classes = 0, v1Students = 0;
  usersSnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`User: ${data.email || doc.id.substr(0,10)} - V1 Classes: ${data.classes?.length || 0}`);
    if (data.classes) {
      v1Classes += data.classes.length;
      data.classes.forEach(cls => {
        v1Students += cls.students?.length || 0;
      });
    }
  });
  
  // Check V2 data
  const v2Classes = await db.collection('classes').get();
  const v2Students = await db.collection('students').get();
  
  console.log(`\nV1 Data: ${v1Classes} classes, ${v1Students} students`);
  console.log(`V2 Data: ${v2Classes.size} classes, ${v2Students.size} students`);
  
  if (v1Classes > 0) {
    console.log('\n✅ Your V1 data is still intact!');
  }
  if (v2Classes.size > 0) {
    console.log('✅ V2 migration data exists!');
  }
}

checkStatus().then(() => process.exit(0));