// pages/api/bulk-update-passwords.js - Bulk Password Updates
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

export default async function bulkUpdatePasswordsHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      passwordUpdates, // Array of { studentId, password }
      classCode,
      architectureVersion = 'unknown'
    } = req.body;

    if (!passwordUpdates || !Array.isArray(passwordUpdates) || !classCode) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['passwordUpdates (array)', 'classCode']
      });
    }

    console.log('🔐 Bulk updating passwords for', passwordUpdates.length, 'students');

    // Hash all passwords
    const hashedUpdates = await Promise.all(
      passwordUpdates.map(async (update) => ({
        studentId: update.studentId,
        passwordHash: await bcrypt.hash(update.password, 10),
        passwordLastUpdated: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    );

    let updatedCount = 0;

    // Try V2 architecture first
    try {
      // Find the class
      const classesQuery = db.collection('classes').where('classCode', '==', classCode.toUpperCase());
      const classesSnapshot = await classesQuery.get();
      
      if (!classesSnapshot.empty) {
        const classDoc = classesSnapshot.docs[0];
        
        // Use batch for efficient updates
        const batch = db.batch();
        
        for (const update of hashedUpdates) {
          const studentRef = db.collection('students').doc(update.studentId);
          batch.update(studentRef, {
            passwordHash: update.passwordHash,
            passwordLastUpdated: update.passwordLastUpdated,
            updatedAt: update.updatedAt
          });
        }
        
        await batch.commit();
        updatedCount = hashedUpdates.length;
        
        console.log('✅ V2 bulk password update completed');
        return res.status(200).json({
          success: true,
          schema: 'v2',
          updatedCount: updatedCount,
          message: `Updated passwords for ${updatedCount} students`
        });
      }
    } catch (v2Error) {
      console.log('⚠️ V2 bulk update failed, trying V1...');
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
              const update = hashedUpdates.find(u => u.studentId === student.id);
              if (update) {
                updatedCount++;
                return {
                  ...student,
                  passwordHash: update.passwordHash,
                  passwordLastUpdated: update.passwordLastUpdated,
                  updatedAt: update.updatedAt
                };
              }
              return student;
            });
            
            return { ...classData, students: updatedStudents };
          }
          return classData;
        });
        
        if (updatedCount > 0) {
          await db.collection('users').doc(userDoc.id).update({
            classes: updatedClasses
          });
          
          console.log('✅ V1 bulk password update completed');
          return res.status(200).json({
            success: true,
            schema: 'v1',
            updatedCount: updatedCount,
            message: `Updated passwords for ${updatedCount} students`
          });
        }
      }
    }

    return res.status(404).json({
      error: 'Class not found',
      message: 'No class found with the provided class code'
    });

  } catch (error) {
    console.error('❌ Bulk password update error:', error);
    return res.status(500).json({
      error: 'Bulk password update failed',
      message: error.message
    });
  }
}