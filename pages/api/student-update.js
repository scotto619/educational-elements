// pages/api/student-update.js - Server-side API for student data updates
import { adminFirestore } from '../../utils/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      teacherUserId, 
      classId, 
      studentId, 
      updateData,
      classCode // For verification
    } = req.body;

    // Validate required fields
    if (!teacherUserId || !classId || !studentId || !updateData || !classCode) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['teacherUserId', 'classId', 'studentId', 'updateData', 'classCode']
      });
    }

    console.log('📝 Student update request:', {
      teacherUserId,
      classId,
      studentId,
      hasUpdateData: !!updateData,
      classCode
    });

    // Get teacher document
    const teacherDocRef = adminFirestore.collection('users').doc(teacherUserId);
    const teacherDoc = await teacherDocRef.get();

    if (!teacherDoc.exists) {
      console.error('❌ Teacher document not found:', teacherUserId);
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherData = teacherDoc.data();
    
    // Find the specific class
    const targetClass = teacherData.classes?.find(cls => 
      cls.id === classId && cls.classCode?.toUpperCase() === classCode.toUpperCase()
    );

    if (!targetClass) {
      console.error('❌ Class not found or class code mismatch');
      return res.status(404).json({ error: 'Class not found or invalid class code' });
    }

    // Find the student in the class
    const studentIndex = targetClass.students?.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
      console.error('❌ Student not found in class:', studentId);
      return res.status(404).json({ error: 'Student not found' });
    }

    // Validate update data to prevent malicious updates
    const allowedFields = [
      'totalPoints', 'currency', 'coinsSpent', 'avatarBase', 
      'ownedAvatars', 'ownedPets', 'rewardsPurchased',
      'gameProgress', 'achievements', 'lastUpdated',
      'clickerGameData'
    ];

    const sanitizedUpdateData = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdateData[key] = value;
      }
    }

    // Add timestamp
    sanitizedUpdateData.lastUpdated = new Date().toISOString();

    // Update the student data
    const updatedClasses = teacherData.classes.map(cls => {
      if (cls.id === classId) {
        const updatedStudents = [...cls.students];
        updatedStudents[studentIndex] = {
          ...updatedStudents[studentIndex],
          ...sanitizedUpdateData
        };
        return {
          ...cls,
          students: updatedStudents
        };
      }
      return cls;
    });

    // Save back to Firestore
    await teacherDocRef.update({ classes: updatedClasses });

    console.log('✅ Student data updated successfully:', {
      studentId,
      updatedFields: Object.keys(sanitizedUpdateData)
    });

    // Return the updated student data
    const updatedStudent = updatedClasses
      .find(cls => cls.id === classId)
      .students.find(s => s.id === studentId);

    res.status(200).json({ 
      success: true, 
      student: updatedStudent,
      message: 'Student data updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating student data:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}