// pages/api/create-student-v2.js - CREATE STUDENT IN NEW ARCHITECTURE
export async function createStudentV2(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      classId,
      firstName,
      lastName = '',
      teacherUserId
    } = req.body;

    if (!classId || !firstName || !teacherUserId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['classId', 'firstName', 'teacherUserId']
      });
    }

    console.log('👤 Creating student (v2):', { classId, firstName, lastName });

    const result = await adminFirestore.runTransaction(async (transaction) => {
      // Verify class exists and teacher owns it
      const classRef = adminFirestore.collection('classes').doc(classId);
      const classDoc = await transaction.get(classRef);

      if (!classDoc.exists) {
        throw new Error('Class not found');
      }

      const classData = classDoc.data();
      if (classData.teacherId !== teacherUserId) {
        throw new Error('Unauthorized: You do not own this class');
      }

      // Create student
      const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const studentRef = adminFirestore.collection('students').doc(studentId);

      const newStudentData = {
        id: studentId,
        classId: classId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        
        // Game progress
        totalPoints: 0,
        currency: 0,
        coinsSpent: 0,
        
        // Avatar & pets
        avatarBase: 'Wizard F',
        avatarLevel: 1,
        ownedAvatars: ['Wizard F'],
        ownedPets: [],
        
        // Game data
        clickerGameData: null,
        mathMentalsProgress: null,
        gameProgress: {},
        achievements: [],
        rewardsPurchased: [],
        
        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        archived: false
      };

      transaction.set(studentRef, newStudentData);

      // Add student to class membership
      const membershipRef = adminFirestore.collection('class_memberships').doc(classId);
      const membershipDoc = await transaction.get(membershipRef);

      if (membershipDoc.exists()) {
        const membershipData = membershipDoc.data();
        const updatedStudents = [...(membershipData.students || []), studentId];

        transaction.update(membershipRef, {
          students: updatedStudents,
          updatedAt: new Date().toISOString()
        });

        // Update class student count
        transaction.update(classRef, {
          studentCount: updatedStudents.length,
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        });
      }

      return newStudentData;
    });

    console.log('✅ Student created successfully:', result.id);

    res.status(200).json({
      success: true,
      student: result,
      message: 'Student created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating student:', error);
    
    res.status(500).json({
      error: 'Failed to create student',
      message: error.message
    });
  }
}