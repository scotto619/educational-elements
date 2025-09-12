// pages/api/student-update-v2.js - UPDATED FOR NEW ARCHITECTURE
import { adminFirestore } from '../../utils/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      studentId,
      updateData,
      classCode, // For verification
      teacherUserId // For additional security
    } = req.body;

    // Validate required fields
    if (!studentId || !updateData || !classCode) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['studentId', 'updateData', 'classCode']
      });
    }

    console.log('📝 Student update request (v2):', {
      studentId,
      hasUpdateData: !!updateData,
      updateType: Object.keys(updateData).join(', '),
      classCode
    });

    // Use transaction for consistency
    const result = await adminFirestore.runTransaction(async (transaction) => {
      // Get student document
      const studentRef = adminFirestore.collection('students').doc(studentId);
      const studentDoc = await transaction.get(studentRef);

      if (!studentDoc.exists) {
        throw new Error('Student not found');
      }

      const studentData = studentDoc.data();
      const classId = studentData.classId;

      // Verify class code by checking class document
      const classRef = adminFirestore.collection('classes').doc(classId);
      const classDoc = await transaction.get(classRef);

      if (!classDoc.exists) {
        throw new Error('Class not found');
      }

      const classData = classDoc.data();
      
      // Verify class code matches
      if (classData.classCode?.toUpperCase() !== classCode.toUpperCase()) {
        throw new Error('Invalid class code');
      }

      // Additional security: verify teacher if provided
      if (teacherUserId && classData.teacherId !== teacherUserId) {
        throw new Error('Unauthorized access');
      }

      // Validate and sanitize update data
      const allowedFields = [
        'totalPoints', 'currency', 'coinsSpent', 'avatarBase', 
        'ownedAvatars', 'ownedPets', 'rewardsPurchased',
        'gameProgress', 'achievements', 'lastUpdated',
        'clickerGameData', 'mathMentalsProgress'
      ];

      const sanitizedUpdateData = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          sanitizedUpdateData[key] = value;
        }
      }

      // Validate numeric fields
      if (sanitizedUpdateData.totalPoints !== undefined) {
        sanitizedUpdateData.totalPoints = Math.max(0, Number(sanitizedUpdateData.totalPoints) || 0);
      }
      if (sanitizedUpdateData.currency !== undefined) {
        sanitizedUpdateData.currency = Math.max(0, Number(sanitizedUpdateData.currency) || 0);
      }
      if (sanitizedUpdateData.coinsSpent !== undefined) {
        sanitizedUpdateData.coinsSpent = Math.max(0, Number(sanitizedUpdateData.coinsSpent) || 0);
      }

      // Add timestamps
      sanitizedUpdateData.updatedAt = new Date().toISOString();
      sanitizedUpdateData.lastActivity = new Date().toISOString();

      // Update student document
      transaction.update(studentRef, sanitizedUpdateData);

      // Update class last activity
      transaction.update(classRef, {
        lastActivity: new Date().toISOString()
      });

      console.log('✅ Student updated successfully:', studentId, Object.keys(sanitizedUpdateData));

      return {
        ...studentData,
        ...sanitizedUpdateData
      };
    });

    res.status(200).json({ 
      success: true, 
      student: result,
      message: 'Student data updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating student data:', error);
    
    const errorResponse = {
      error: 'Update failed',
      message: error.message
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  }
}