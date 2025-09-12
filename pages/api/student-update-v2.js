// pages/api/student-update-v2.js - FIXED VERSION
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PROJECT_ID) {
      console.error('❌ Missing Firebase Admin SDK environment variables');
      throw new Error('Missing Firebase Admin SDK environment variables');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });

    console.log('✅ Firebase Admin SDK initialized for API');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

const db = admin.firestore();

// Build an update object that uses FieldValue.increment for numerics when mode==='increment'
function buildMergedUpdate(updateData = {}, mode = 'increment') {
  const out = {};
  for (const [k, v] of Object.entries(updateData)) {
    if (typeof v === 'number' && mode === 'increment') {
      out[k] = admin.firestore.FieldValue.increment(v);
    } else {
      out[k] = v;
    }
  }
  const ts = admin.firestore.FieldValue.serverTimestamp();
  out.updatedAt = ts;
  out.lastActivity = ts;
  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      studentId,
      classCode,          // required: used to validate/locate class
      updateData,         // e.g. { totalPoints: 1 } or { currency: -1 } or { clickerGameData: {...} }
      mode = 'increment', // 'increment' (numbers) or 'set' (objects)
      note = '',
      opId,               // optional idempotency key (not persisted yet)
      teacherUserId,      // OPTIONAL: teacher UID from the dashboard (skips publicClassData lookup)
    } = req.body || {};

    console.log('📥 Student update request:', { 
      studentId: studentId?.substring(0, 10) + '...', 
      classCode, 
      mode, 
      updateKeys: Object.keys(updateData || {}),
      teacherProvided: !!teacherUserId 
    });

    if (!studentId || !classCode || !updateData) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'studentId, classCode, updateData are required',
        received: { studentId: !!studentId, classCode: !!classCode, updateData: !!updateData }
      });
    }

    const result = await db.runTransaction(async (tx) => {
      try {
        // ---- V2 path (after migration) ----
        console.log('🔍 Checking V2 architecture first...');
        const studentRef = db.collection('students').doc(studentId);
        const studentSnap = await tx.get(studentRef);

        if (studentSnap.exists) {
          console.log('✅ Found student in V2 architecture');
          const sData = studentSnap.data();
          if (!sData.classId) throw new Error('Student missing classId (V2)');

          const classRef = db.collection('classes').doc(sData.classId);
          const classSnap = await tx.get(classRef);
          if (!classSnap.exists) throw new Error('Class not found (V2)');

          const classData = classSnap.data();
          if ((classData.classCode || '').toUpperCase() !== (classCode || '').toUpperCase()) {
            throw new Error(`Invalid class code. Expected: ${classData.classCode}, Got: ${classCode}`);
          }
          if (teacherUserId && classData.teacherId !== teacherUserId) {
            throw new Error('Unauthorized (teacher mismatch)');
          }

          const merged = buildMergedUpdate(updateData, mode);
          console.log('🔄 Applying V2 update:', Object.keys(merged));
          
          tx.set(studentRef, merged, { merge: true });
          tx.set(classRef, { lastActivity: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

          return { schema: 'v2', studentId: studentRef.id };
        }

        // ---- V1 fallback (pre-migration): update nested array in users/{teacherId}.classes[] ----
        console.log('🔄 Falling back to V1 architecture...');
        
        // Prefer teacherUserId if provided by the dashboard; otherwise resolve via publicClassData/{classCode}.
        let teacherId = teacherUserId;
        if (!teacherId) {
          console.log('🔍 Looking up teacher via publicClassData...');
          const pubRef = db.collection('publicClassData').doc(classCode);
          const pubSnap = await tx.get(pubRef);
          if (!pubSnap.exists) {
            // Try to find teacher by scanning user documents (fallback)
            console.log('⚠️ No publicClassData, scanning user documents...');
            const usersSnapshot = await db.collection('users').get();
            let foundTeacherId = null;
            
            for (const userDoc of usersSnapshot.docs) {
              const userData = userDoc.data();
              if (userData.classes) {
                const hasClass = userData.classes.some(cls => 
                  cls.classCode && cls.classCode.toUpperCase() === classCode.toUpperCase()
                );
                if (hasClass) {
                  foundTeacherId = userDoc.id;
                  break;
                }
              }
            }
            
            if (!foundTeacherId) {
              throw new Error(`Class code not found: ${classCode}`);
            }
            teacherId = foundTeacherId;
          } else {
            teacherId = pubSnap.get('teacherId');
            if (!teacherId) throw new Error('teacherId missing on publicClassData');
          }
        }

        console.log('👨‍🏫 Using teacher ID:', teacherId?.substring(0, 10) + '...');

        const userRef = db.collection('users').doc(teacherId);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) throw new Error('Teacher user doc not found (V1)');

        const userData = userSnap.data() || {};
        const classes = Array.isArray(userData.classes) ? [...userData.classes] : [];

        const ci = classes.findIndex(
          c => c && (
            ((c.classCode || '').toUpperCase() === (classCode || '').toUpperCase()) || 
            c.id === classCode ||
            c.classId === classCode
          )
        );
        if (ci < 0) throw new Error(`Class not found in V1 user doc for code: ${classCode}`);

        const cls = { ...classes[ci] };
        const studs = Array.isArray(cls.students) ? [...cls.students] : [];
        const si = studs.findIndex(s => s && (s.id === studentId || s.studentId === studentId));
        if (si < 0) throw new Error(`Student not found in V1 class: ${studentId}`);

        const s = { ...studs[si] };
        
        // Apply updates
        console.log('🔄 Applying V1 updates:', Object.keys(updateData));
        for (const [k, v] of Object.entries(updateData)) {
          if (typeof v === 'number' && mode === 'increment') {
            const curr = Number(s[k] || 0);
            s[k] = Math.max(0, curr + v); // Prevent negative values
            console.log(`  ${k}: ${curr} + ${v} = ${s[k]}`);
          } else {
            s[k] = v;
          }
        }
        
        const ts = admin.firestore.FieldValue.serverTimestamp();
        s.updatedAt = ts;
        s.lastActivity = ts;

        studs[si] = s;
        cls.students = studs;
        cls.lastActivity = ts;
        classes[ci] = cls;

        tx.update(userRef, { classes });

        return { schema: 'v1', studentId, teacherId };
        
      } catch (txError) {
        console.error('💥 Transaction error:', txError);
        throw txError;
      }
    });

    console.log('✅ Student update completed:', result);
    return res.status(200).json({ success: true, ...result, note });
    
  } catch (err) {
    console.error('💥 student-update-v2 failed:', err);
    
    const errorResponse = {
      error: 'Update failed',
      message: err?.message || String(err),
      timestamp: new Date().toISOString()
    };
    
    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err?.stack;
      errorResponse.details = {
        requestBody: req.body,
        errorType: err?.constructor?.name || 'Unknown'
      };
    }
    
    return res.status(500).json(errorResponse);
  }
}