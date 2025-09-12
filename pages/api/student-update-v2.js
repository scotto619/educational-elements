// pages/api/student-update-v2.js
import admin, { adminFirestore as db } from '../../utils/firebase-admin';

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      studentId,
      classCode,       // required for auth check (student portal too)
      updateData,      // e.g., { totalPoints: 1 } or { currency: -1 } or { clickerGameData: {...} }
      mode = 'increment',
      note = '',
      opId,            // optional idempotency key
      teacherUserId,   // optional extra check (from teacher UI)
    } = req.body || {};

    if (!studentId || !classCode || !updateData) {
      return res.status(400).json({ error: 'Missing required fields', message: 'studentId, classCode, updateData are required' });
    }

    const result = await db.runTransaction(async (tx) => {
      // -------- Try V2 first: students/{studentId} exists after migration --------
      const studentRef = db.collection('students').doc(studentId);
      const studentSnap = await tx.get(studentRef);

      if (studentSnap.exists) {
        const studentData = studentSnap.data();
        if (!studentData.classId) throw new Error('Student missing classId (V2)');

        const classRef = db.collection('classes').doc(studentData.classId);
        const classSnap = await tx.get(classRef);
        if (!classSnap.exists) throw new Error('Class not found (V2)');

        const classData = classSnap.data();
        const codeV2 = (classData.classCode || '').toUpperCase();
        if (codeV2 !== (classCode || '').toUpperCase()) throw new Error('Invalid class code');
        if (teacherUserId && classData.teacherId !== teacherUserId) throw new Error('Unauthorized (teacher mismatch)');

        // Apply update
        const merged = buildMergedUpdate(updateData, mode);
        tx.set(studentRef, merged, { merge: true });
        tx.set(classRef, { lastActivity: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

        return { schema: 'v2', student: { id: studentRef.id, ...studentData } };
      }

      // -------- V1 fallback (pre-migration): update nested array in users/{teacherId}.classes[] --------
      // 1) Find teacher via publicClassData/{classCode}
      const pubRef = db.collection('publicClassData').doc(classCode);
      const pubSnap = await tx.get(pubRef);
      if (!pubSnap.exists) throw new Error('Class code not found (publicClassData)');
      const teacherId = pubSnap.get('teacherId');
      if (!teacherId) throw new Error('teacherId missing on publicClassData');
      if (teacherUserId && teacherUserId !== teacherId) throw new Error('Unauthorized (teacher mismatch)');

      // 2) Load users/{teacherId} and mutate class + student in the nested structure
      const userRef = db.collection('users').doc(teacherId);
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error('Teacher user doc not found (V1)');
      const userData = userSnap.data() || {};

      const classes = Array.isArray(userData.classes) ? [...userData.classes] : [];
      const ci = classes.findIndex(c => c && ((c.classCode || '').toUpperCase() === (classCode || '').toUpperCase() || c.id === classCode));
      if (ci < 0) throw new Error('Class not found in V1 user doc');
      const cls = { ...classes[ci] };

      const studs = Array.isArray(cls.students) ? [...cls.students] : [];
      const si = studs.findIndex(s => s && (s.id === studentId || s.studentId === studentId));
      if (si < 0) throw new Error('Student not found in V1 class');

      const s = { ...studs[si] };
      for (const [k, v] of Object.entries(updateData)) {
        if (typeof v === 'number' && mode === 'increment') {
          const curr = Number(s[k] || 0);
          s[k] = curr + v;
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

      return { schema: 'v1', student: s };
    });

    return res.status(200).json({ success: true, ...result, note });
  } catch (err) {
    console.error('student-update-v2 failed:', err);
    return res.status(500).json({ error: 'Update failed', message: err?.message || String(err) });
  }
}
