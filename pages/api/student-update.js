// pages/api/student-update.js - FIXED API for Math Mentals progress saving
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

    console.log('🔄 Student update request:', {
      teacherUserId,
      classId,
      studentId,
      hasUpdateData: !!updateData,
      updateType: Object.keys(updateData).join(', '),
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
      'clickerGameData',
      'sweetEmpireData',      // Sweet Empire clicker game (replaces Hero Forge)
      'menagerieData',        // Champion's Menagerie creature collector
      'homesteadData',        // Wildwood Homestead survival-crafting game
      'townSquareData',       // Town Square multiplayer plaza (stalls/market)
      'moneyMastersProgress', // Money Masters financial literacy tool
      'keyboardQuestProgress', // Keyboard Quest typing program
      'mathMentalsProgress' // Math Mentals specific field
    ];

    const sanitizedUpdateData = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdateData[key] = value;
      }
    }

    // Add timestamp
    sanitizedUpdateData.lastUpdated = new Date().toISOString();

    console.log('🔍 Sanitized update data:', Object.keys(sanitizedUpdateData));

    // Get current student data
    const currentStudent = targetClass.students[studentIndex];

    // Update the student data in the main students array
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

    // CRITICAL FIX: Update student progress in math groups using correct data structure
    if (sanitizedUpdateData.mathMentalsProgress && updatedClasses) {
      console.log('🧮 Processing Math Mentals progress update...');
      
      const classIndex = updatedClasses.findIndex(cls => cls.id === classId);
      if (classIndex !== -1) {
        // FIXED: Look for mathMentalsGroups instead of mathMentalsData.groups
        const mathGroups = updatedClasses[classIndex].toolkitData?.mathMentalsGroups;
        
        if (mathGroups && Array.isArray(mathGroups)) {
          console.log('📊 Found math groups:', mathGroups.length);
          
          // Find and update the student in their math group
          let groupUpdated = false;
          mathGroups.forEach((group, groupIndex) => {
            const groupStudentIndex = group.students.findIndex(s => s.id === studentId);
            if (groupStudentIndex !== -1) {
              const mathProgress = sanitizedUpdateData.mathMentalsProgress;
              
              // Update the student in the math group
              mathGroups[groupIndex].students[groupStudentIndex] = {
                ...mathGroups[groupIndex].students[groupStudentIndex],
                currentLevel: mathProgress.currentLevel,
                progress: mathProgress.progress,
                streak: mathProgress.streak,
                lastUpdated: new Date().toISOString()
              };
              
              console.log('📈 Updated student in math group:', {
                groupName: group.name,
                studentName: currentStudent.firstName,
                newLevel: mathProgress.currentLevel,
                streak: mathProgress.streak,
                progressEntries: Object.keys(mathProgress.progress).length
              });
              
              groupUpdated = true;
            }
          });

          if (groupUpdated) {
            // Update the toolkit data with the modified groups
            updatedClasses[classIndex].toolkitData = {
              ...updatedClasses[classIndex].toolkitData,
              mathMentalsGroups: mathGroups,
              lastUpdated: new Date().toISOString()
            };
            console.log('✅ Math group data updated successfully');
          } else {
            console.log('⚠️ Student not found in any math group');
          }
        } else {
          console.log('ℹ️ No mathMentalsGroups found in toolkitData');
        }
      }
    }

    // Save back to Firestore
    await teacherDocRef.update({ classes: updatedClasses });

    console.log('✅ Student data updated successfully:', {
      studentName: currentStudent.firstName,
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
    
    // Return more specific error info in development
    const errorResponse = {
      error: 'Internal server error',
      message: error.message
    };
    
    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  }
}