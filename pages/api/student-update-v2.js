// pages/api/student-update-v2.js - ENHANCED DEBUG VERSION
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PROJECT_ID) {
      console.error('❌ Missing Firebase Admin SDK environment variables');
      throw new Error('Missing Firebase Admin SDK environment variables');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });

    console.log('✅ Firebase Admin SDK initialized for API');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      studentId,
      classCode,
      updateData,
      mode = 'increment',
      note = '',
      teacherUserId,
    } = req.body || {};

    console.log('🔥 DEBUG - Student update request:', { 
      studentId: studentId?.substring(0, 10) + '...', 
      classCode, 
      mode, 
      updateKeys: Object.keys(updateData || {}),
      teacherProvided: !!teacherUserId 
    });

    // Validate required fields
    if (!studentId || !classCode || !updateData) {
      const error = {
        error: 'Missing required fields', 
        message: 'studentId, classCode, updateData are required',
        received: { 
          studentId: !!studentId, 
          classCode: !!classCode, 
          updateData: !!updateData,
          actualValues: {
            studentId: studentId || 'undefined',
            classCode: classCode || 'undefined',
            updateData: updateData || 'undefined'
          }
        }
      };
      console.log('❌ Validation failed:', error);
      return res.status(400).json(error);
    }

    // Check V2 architecture first
    console.log('🔍 Checking V2 architecture...');
    const studentRef = db.collection('students').doc(studentId);
    
    try {
      const studentDoc = await studentRef.get();
      
      if (studentDoc.exists) {
        console.log('✅ Found student in V2 architecture');
        const studentData = studentDoc.data();
        console.log('🔍 Student data keys:', Object.keys(studentData));
        
        if (!studentData.classId) {
          throw new Error('Student missing classId (V2)');
        }

        // Verify class and permissions
        const classRef = db.collection('classes').doc(studentData.classId);
        const classDoc = await classRef.get();
        
        if (!classDoc.exists) {
          throw new Error('Class not found (V2)');
        }

        const classData = classDoc.data();
        console.log('🔍 Class data keys:', Object.keys(classData));
        console.log('🔍 Class code comparison:', {
          expected: classData.classCode,
          provided: classCode,
          match: (classData.classCode || '').toUpperCase() === (classCode || '').toUpperCase()
        });
        
        if ((classData.classCode || '').toUpperCase() !== (classCode || '').toUpperCase()) {
          throw new Error(`Invalid class code. Expected: ${classData.classCode}, Got: ${classCode}`);
        }
        
        if (teacherUserId && classData.teacherId !== teacherUserId) {
          throw new Error('Unauthorized (teacher mismatch)');
        }

        // Prepare updates
        const now = new Date().toISOString();
        const updateFields = { ...updateData };
        
        // Handle increment operations manually
        if (mode === 'increment') {
          for (const [key, value] of Object.entries(updateData)) {
            if (typeof value === 'number') {
              const currentValue = Number(studentData[key] || 0);
              updateFields[key] = Math.max(0, currentValue + value);
              console.log(`🔄 ${key}: ${currentValue} + ${value} = ${updateFields[key]}`);
            }
          }
        }

        // Add timestamps
        updateFields.updatedAt = now;
        updateFields.lastActivity = now;

        console.log('🔄 Applying V2 update:', Object.keys(updateFields));
        
        // Update student document
        await studentRef.update(updateFields);
        
        // Update class last activity
        await classRef.update({ lastActivity: now });

        console.log('✅ V2 student update completed successfully');
        
        return res.status(200).json({ 
          success: true, 
          schema: 'v2', 
          studentId: studentRef.id,
          note,
          debug: {
            originalValues: Object.keys(updateData).reduce((acc, key) => {
              acc[key] = studentData[key];
              return acc;
            }, {}),
            newValues: updateFields
          }
        });
      }
    } catch (v2Error) {
      console.log('❌ V2 error:', v2Error.message);
      console.log('🔄 Will try V1 fallback...');
    }

    // V1 fallback path
    console.log('🔄 Falling back to V1 architecture...');
    
    let teacherId = teacherUserId;
    if (!teacherId) {
      // Try to find teacher by class code
      console.log('🔍 Looking for teacher by class code...');
      const usersSnapshot = await db.collection('users').get();
      let foundTeacherId = null;
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.classes && Array.isArray(userData.classes)) {
          const hasClass = userData.classes.some(cls => 
            cls.classCode && cls.classCode.toUpperCase() === classCode.toUpperCase()
          );
          if (hasClass) {
            foundTeacherId = userDoc.id;
            console.log('✅ Found teacher:', foundTeacherId.substring(0, 10) + '...');
            break;
          }
        }
      }
      
      if (!foundTeacherId) {
        throw new Error(`Class code not found: ${classCode}`);
      }
      teacherId = foundTeacherId;
    }

    console.log('👨‍🏫 Using teacher ID:', teacherId?.substring(0, 10) + '...');

    // Get user document
    const userRef = db.collection('users').doc(teacherId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('Teacher user doc not found (V1)');
    }

    const userData = userDoc.data() || {};
    const classes = Array.isArray(userData.classes) ? [...userData.classes] : [];
    console.log('🔍 Found', classes.length, 'classes in V1 user doc');

    // Find the class
    const classIndex = classes.findIndex(
      c => c && (
        ((c.classCode || '').toUpperCase() === (classCode || '').toUpperCase()) || 
        c.id === classCode ||
        c.classId === classCode
      )
    );
    
    if (classIndex < 0) {
      console.log('❌ Available class codes:', classes.map(c => c?.classCode).filter(Boolean));
      throw new Error(`Class not found in V1 user doc for code: ${classCode}`);
    }

    const targetClass = { ...classes[classIndex] };
    const students = Array.isArray(targetClass.students) ? [...targetClass.students] : [];
    console.log('🔍 Found', students.length, 'students in class');
    
    // Find the student
    const studentIndex = students.findIndex(s => s && (s.id === studentId || s.studentId === studentId));
    
    if (studentIndex < 0) {
      console.log('❌ Available student IDs:', students.map(s => s?.id).filter(Boolean).slice(0, 5));
      throw new Error(`Student not found in V1 class: ${studentId}`);
    }

    const student = { ...students[studentIndex] };
    console.log('✅ Found student:', student.firstName);
    
    // Apply updates manually for V1
    console.log('🔄 Applying V1 updates:', Object.keys(updateData));
    const now = new Date().toISOString();
    
    const originalValues = {};
    for (const [key, value] of Object.entries(updateData)) {
      originalValues[key] = student[key];
      if (typeof value === 'number' && mode === 'increment') {
        const current = Number(student[key] || 0);
        student[key] = Math.max(0, current + value);
        console.log(`  ${key}: ${current} + ${value} = ${student[key]}`);
      } else {
        student[key] = value;
      }
    }
    
    // Update timestamps
    student.updatedAt = now;
    student.lastActivity = now;

    // Update arrays
    students[studentIndex] = student;
    targetClass.students = students;
    targetClass.lastActivity = now;
    classes[classIndex] = targetClass;

    // Update user document
    await userRef.update({ classes });

    console.log('✅ V1 student update completed successfully');

    return res.status(200).json({ 
      success: true, 
      schema: 'v1', 
      studentId, 
      teacherId,
      note,
      debug: {
        originalValues,
        newValues: updateData
      }
    });

  } catch (err) {
    console.error('💥 student-update-v2 failed:', err);
    
    const errorResponse = {
      error: 'Update failed',
      message: err?.message || String(err),
      timestamp: new Date().toISOString(),
      stack: err?.stack
    };
    
    // Add detailed error info in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = {
        requestBody: req.body,
        errorType: err?.constructor?.name || 'Unknown'
      };
    }
    
    return res.status(500).json(errorResponse);
  }
}