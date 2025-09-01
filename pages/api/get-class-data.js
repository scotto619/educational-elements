// pages/api/get-class-data.js - NEW API to refresh class data for students
import { adminFirestore } from '../../utils/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { teacherUserId, classId, classCode } = req.body;

    // Validate required fields
    if (!teacherUserId || !classId || !classCode) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['teacherUserId', 'classId', 'classCode']
      });
    }

    console.log('Getting fresh class data for:', { teacherUserId, classId, classCode });

    // Get teacher document
    const teacherDocRef = adminFirestore.collection('users').doc(teacherUserId);
    const teacherDoc = await teacherDocRef.get();

    if (!teacherDoc.exists) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherData = teacherDoc.data();
    
    // Find the specific class
    const targetClass = teacherData.classes?.find(cls => 
      cls.id === classId && cls.classCode?.toUpperCase() === classCode.toUpperCase()
    );

    if (!targetClass) {
      return res.status(404).json({ error: 'Class not found or invalid class code' });
    }

    console.log('Class data retrieved successfully');

    res.status(200).json({ 
      success: true, 
      classData: targetClass,
      message: 'Class data retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting class data:', error);
    
    const errorResponse = {
      error: 'Internal server error',
      message: error.message
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  }
}