// pages/api/get-class-data.js - NEW API to refresh class data for students
import { adminFirestore } from '../../utils/firebase-admin';
import { withHandler, requireFields, ApiError } from '../../utils/apiHelpers';

export default withHandler('POST', async (req, res) => {
    requireFields(req.body, ['teacherUserId', 'classId', 'classCode']);

    const { teacherUserId, classId, classCode } = req.body;

    console.log('Getting fresh class data for:', { teacherUserId, classId, classCode });

    // Get teacher document
    const teacherDocRef = adminFirestore.collection('users').doc(teacherUserId);
    const teacherDoc = await teacherDocRef.get();

    if (!teacherDoc.exists) {
      throw new ApiError(404, 'Teacher not found');
    }

    const teacherData = teacherDoc.data();
    
    // Find the specific class
    const targetClass = teacherData.classes?.find(cls => 
      cls.id === classId && cls.classCode?.toUpperCase() === classCode.toUpperCase()
    );

    if (!targetClass) {
      throw new ApiError(404, 'Class not found or invalid class code');
    }

    console.log('Class data retrieved successfully');

    res.status(200).json({ 
      success: true, 
      classData: targetClass,
      message: 'Class data retrieved successfully'
    });

});