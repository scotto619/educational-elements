// pages/api/update-student-password.js - Update Individual Student Password
import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      studentId,
      newPassword,
      classCode,
      architectureVersion = 'unknown'
    } = req.body;

    if (!studentId || !newPassword || !classCode) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['studentId', 'newPassword', 'classCode']
      });
    }

    console.log('🔑 Updating password for student:', studentId.substring(0, 10) + '...');

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updateData = {
      passwordHash: passwordHash,
      passwordLastUpdated: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Try V2 architecture first
    try {
      const studentRef = db.collection('students').doc(studentId);
      const studentDoc = await studentRef.get();
      
      if (studentDoc.exists) {
        const studentData = studentDoc.data();
        
        // Verify class code
        const classRef = db.collection('classes').doc(studentData.classId);
        const classDoc = await classRef.get();
        
        if (classDoc.exists()) {
          const classData = classDoc.data();
          if (classData.classCode?.toUpperCase() === classCode.toUpperCase()) {
            await studentRef.update(updateData);
            
            console.log('✅ V2 password updated successfully');
            return res.status(200).json({
              success: true,
              schema: 'v2',
              message: 'Password updated successfully'
            });
          }
        }
      }
    } catch (v2Error) {
      console.log('⚠️ V2 update failed, trying V1...');
    }

    // V1 fallback
    const usersSnapshot = await db.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.classes && Array.isArray(userData.classes)) {
        
        const updatedClasses = userData.classes.map(classData => {
          if (classData.classCode?.toUpperCase() === classCode.toUpperCase() &&
              classData.students && Array.isArray(classData.students)) {
            
            const updatedStudents = classData.students.map(student => {
              if (student.id === studentId) {
                return { ...student, ...updateData };
              }
              return student;
            });
            
            return { ...classData, students: updatedStudents };
          }
          return classData;
        });
        
        if (JSON.stringify(updatedClasses) !== JSON.stringify(userData.classes)) {
          await db.collection('users').doc(userDoc.id).update({
            classes: updatedClasses
          });
          
          console.log('✅ V1 password updated successfully');
          return res.status(200).json({
            success: true,
            schema: 'v1',
            message: 'Password updated successfully'
          });
        }
      }
    }

    return res.status(404).json({
      error: 'Student not found',
      message: 'Student not found in any class with the provided class code'
    });

  } catch (error) {
    console.error('❌ Password update error:', error);
    return res.status(500).json({
      error: 'Password update failed',
      message: error.message
    });
  }
}

