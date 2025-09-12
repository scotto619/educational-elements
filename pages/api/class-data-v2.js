// pages/api/class-data-v2.js - GET CLASS WITH STUDENTS
export async function getClassDataV2(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { classId, teacherUserId, classCode } = req.body;

    if (!classId || (!teacherUserId && !classCode)) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['classId', 'teacherUserId OR classCode']
      });
    }

    console.log('🔍 Getting class data (v2):', { classId, teacherUserId, classCode });

    const result = await adminFirestore.runTransaction(async (transaction) => {
      // Get class document
      const classRef = adminFirestore.collection('classes').doc(classId);
      const classDoc = await transaction.get(classRef);

      if (!classDoc.exists) {
        throw new Error('Class not found');
      }

      const classData = classDoc.data();

      // Verify access
      if (teacherUserId && classData.teacherId !== teacherUserId) {
        throw new Error('Unauthorized access');
      }

      if (classCode && classData.classCode?.toUpperCase() !== classCode.toUpperCase()) {
        throw new Error('Invalid class code');
      }

      // Get class membership (student IDs)
      const membershipRef = adminFirestore.collection('class_memberships').doc(classId);
      const membershipDoc = await transaction.get(membershipRef);

      let students = [];
      if (membershipDoc.exists()) {
        const membershipData = membershipDoc.data();
        const studentIds = membershipData.students || [];

        // Get all student documents in parallel
        if (studentIds.length > 0) {
          const studentRefs = studentIds.map(id => 
            adminFirestore.collection('students').doc(id)
          );
          
          const studentDocs = await Promise.all(
            studentRefs.map(ref => transaction.get(ref))
          );

          students = studentDocs
            .filter(doc => doc.exists)
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
      }

      return {
        ...classData,
        students: students
      };
    });

    console.log('✅ Class data retrieved successfully');

    res.status(200).json({ 
      success: true, 
      classData: result,
      message: 'Class data retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting class data:', error);
    
    const errorResponse = {
      error: 'Failed to get class data',
      message: error.message
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  }
}