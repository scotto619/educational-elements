// pages/api/award-xp-v2.js - BULK XP AWARDING WITH RACE CONDITION PREVENTION
export async function awardXpV2(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      studentIds, // Array of student IDs
      amount,
      reason = 'XP Award',
      teacherUserId,
      classId
    } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['studentIds (array)', 'amount']
      });
    }

    console.log('🏆 Bulk XP award (v2):', {
      studentCount: studentIds.length,
      amount,
      reason
    });

    // Process in smaller batches to avoid timeout
    const batchSize = 50;
    const results = [];
    const errors = [];

    for (let i = 0; i < studentIds.length; i += batchSize) {
      const batch = studentIds.slice(i, i + batchSize);
      
      try {
        const batchResults = await adminFirestore.runTransaction(async (transaction) => {
          const batchResults = [];

          for (const studentId of batch) {
            try {
              const studentRef = adminFirestore.collection('students').doc(studentId);
              const studentDoc = await transaction.get(studentRef);

              if (!studentDoc.exists) {
                errors.push({ studentId, error: 'Student not found' });
                continue;
              }

              const studentData = studentDoc.data();
              const currentPoints = Number(studentData.totalPoints) || 0;
              const newPoints = Math.max(0, currentPoints + Number(amount));

              transaction.update(studentRef, {
                totalPoints: newPoints,
                updatedAt: new Date().toISOString(),
                lastActivity: new Date().toISOString()
              });

              batchResults.push({
                studentId,
                oldPoints: currentPoints,
                newPoints: newPoints,
                awarded: Number(amount)
              });

            } catch (error) {
              errors.push({ studentId, error: error.message });
            }
          }

          return batchResults;
        });

        results.push(...batchResults);

      } catch (error) {
        console.error(`❌ Error in batch ${i/batchSize + 1}:`, error);
        batch.forEach(studentId => {
          errors.push({ studentId, error: error.message });
        });
      }

      // Small delay between batches
      if (i + batchSize < studentIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Update class last activity
    if (classId) {
      try {
        await adminFirestore.collection('classes').doc(classId).update({
          lastActivity: new Date().toISOString()
        });
      } catch (error) {
        console.log('Warning: Could not update class activity');
      }
    }

    console.log('✅ Bulk XP award completed:', {
      successful: results.length,
      failed: errors.length
    });

    res.status(200).json({
      success: true,
      results: results,
      errors: errors,
      message: `Successfully awarded XP to ${results.length} students`
    });

  } catch (error) {
    console.error('❌ Error in bulk XP award:', error);
    
    res.status(500).json({
      error: 'Bulk XP award failed',
      message: error.message
    });
  }
}