// pages/api/update-class-v2.js - UPDATE CLASS SETTINGS
import { withHandler, requireFields, ApiError } from '../../utils/apiHelpers';

export async function updateClassV2(req, res) {
  return withHandler('POST', async (req, res) => {
    requireFields(req.body, ['classId', 'updates', 'teacherUserId']);

    const {
      classId,
      updates,
      teacherUserId
    } = req.body;

    console.log('🏫 Updating class (v2):', { classId, updates: Object.keys(updates) });

    const result = await adminFirestore.runTransaction(async (transaction) => {
      const classRef = adminFirestore.collection('classes').doc(classId);
      const classDoc = await transaction.get(classRef);

      if (!classDoc.exists) {
        throw new ApiError(404, 'Class not found');
      }

      const classData = classDoc.data();
      if (classData.teacherId !== teacherUserId) {
        throw new ApiError(403, 'Unauthorized: You do not own this class');
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

  })(req, res);
}

export default updateClassV2;