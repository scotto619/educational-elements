// pages/api/update-class-v2.js - UPDATE CLASS SETTINGS
export async function updateClassV2(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      classId,
      updates,
      teacherUserId
    } = req.body;

    if (!classId || !updates || !teacherUserId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['classId', 'updates', 'teacherUserId']
      });
    }

    console.log('🏫 Updating class (v2):', { classId, updates: Object.keys(updates) });

    const result = await adminFirestore.runTransaction(async (transaction) => {
      const classRef = adminFirestore.collection('classes').doc(classId);
      const classDoc = await transaction.get(classRef);

      if (!classDoc.exists) {
        throw new Error('Class not found');
      }

      const classData = classDoc.data();
      if (classData.teacherId !== teacherUserId) {
        throw new Error('Unauthorized: You do not own this class');
      }

      // Sanitize updates - only allow certain fields
      const allowedFields = [
        'name', 'classCode', 'xpCategories', 'classRewards', 
        'activeQuests', 'attendanceData', 'toolkitData'
      ];

      const sanitizedUpdates = {};
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          sanitizedUpdates[key] = value;
        }
      }

      sanitizedUpdates.updatedAt = new Date().toISOString();
      sanitizedUpdates.lastActivity = new Date().toISOString();

      transaction.update(classRef, sanitizedUpdates);

      console.log('✅ Class updated successfully:', classId);

      return {
        ...classData,
        ...sanitizedUpdates
      };
    });

    res.status(200).json({
      success: true,
      classData: result,
      message: 'Class updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating class:', error);
    
    res.status(500).json({
      error: 'Failed to update class',
      message: error.message
    });
  }
}

// Export all functions for Next.js API routes
export {
  getClassDataV2 as default
};