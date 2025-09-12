// pages/api/student-update-v2.js
import { adminFirestore } from '../../utils/firebase-admin';

// helper applies FieldValue.increment for numeric keys when mode==='increment'
function buildMergedUpdate(admin, updateData, mode) {
  const out = {};
  for (const [k, v] of Object.entries(updateData || {})) {
    if (typeof v === 'number' && mode === 'increment') {
      out[k] = admin.firestore.FieldValue.increment(v);
    } else {
      out[k] = v;
    }
  }
  out.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  out.lastActivity = admin.firestore.FieldValue.serverTimestamp();
  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const {
      studentId,
      classCode,
      updateData,
      mode = 'increment',
      note = '',
      opId,
      teacherUserId // optional, extra check
    } = req.body || {};

    if (!studentId || !classCode || !updateData) {
      return res.status(400).json({ error: 'Missing required fields', required: ['studentId','classCode','updateData'] });
    }

    const admin = require('firebase-admin');
    const db = adminFirestore;

    const result = await db.runTransaction(async (tx) => {
      const studentRef = db.collection('students').doc(studentId);
      const studentSnap = await tx.get(studentRef);

      if (studentSnap.exists) {
        // ---- V2 path ----
        const studentData = studentSnap.data();
        const classRef = db.collection('classes').doc(studentData.classId);
        const classSnap = await tx.get(classRef);
        if (!classSnap.exists) throw new Error('Class not found (V2)');

        const classData = classSnap.data();
        if ((classData.classCode || '').toUpperCase() !== classCode.toUpperCase()) throw new Error('Invalid class code');
        if (teacherUserId && classData.teacherId !== teacherUserId) throw new Error('Unauthorized access');

        const merged = buildMergedUpdate(admin, updateData, mode);
        tx.set(studentRef, merged, { merge: true });
        tx.set(classRef, { lastActivity: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

        return { ...studentData, ...updateData };
      }

      // ---- V1 fallback (pre-migration) ----
      // 1) find teacher via publicClassData/{classCode}
      const pubRef = db.collection('publicClassData').doc(classCode);
      const pubSnap = await tx.get(pubRef);
      if (!pubSnap.exists) throw new Error('Class code not found (publicClassData)');
      const teacherId = pubSnap.get('teacherId');
      if (!teacherId) throw new Error('teacherId missing on publicClassData');

      // 2) load users/{teacherId} and mutate nested class->students structure
      const userRef = db.collection('users').doc(teacherId);
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error('Teacher user doc not found (V1)');
      const userData = userSnap.data() || {};

      const classes = Array.isArray(userData.classes) ? [...userData.classes] : [];
      const ci = classes.findIndex(c => c && (c.classCode === classCode || c.id === classCode));
      if (ci < 0) throw new Error('Class not found in V1 user doc');

      const cls = { ...classes[ci] };
      const studs = Array.isArray(cls.students) ? [...cls.students] : [];
      const si = studs.findIndex(s => s && (s.id === studentId || s.studentId === studentId));
      if (si < 0) throw new Error('Student not found in V1 class');

      const s = { ...studs[si] };
      for (const [k, v] of Object.entries(updateData || {})) {
        if (typeof v === 'number' && mode === 'increment') {
          const curr = Number(s[k] || 0);
          s[k] = curr + v;
        } else {
          s[k] = v;
        }
      }
      s.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      s.lastActivity = admin.firestore.FieldValue.serverTimestamp();

      studs[si] = s;
      cls.students = studs;
      cls.lastActivity = admin.firestore.FieldValue.serverTimestamp();
      classes[ci] = cls;

      tx.update(userRef, { classes });

      return s;
    });

    return res.status(200).json({ success: true, student: result, note });
  } catch (err) {
    console.error('student-update-v2 failed:', err);
    return res.status(500).json({ error: 'Update failed', message: err.message });
  }
}
