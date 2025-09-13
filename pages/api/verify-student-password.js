// pages/api/verify-student-password.js - Student Password Verification API
import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
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
      password,
      classCode,
      architectureVersion = 'unknown'
    } = req.body;

    console.log('🔐 Password verification request:', { 
      studentId: studentId?.substring(0, 10) + '...',
      classCode,
      architectureVersion,
      hasPassword: !!password
    });

    // Validate required fields
    if (!studentId || !password || !classCode) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['studentId', 'password', 'classCode']
      });
    }

    // Try V2 architecture first
    try {
      console.log('🔍 Checking V2 architecture...');
      
      const studentRef = db.collection('students').doc(studentId);
      const studentDoc = await studentRef.get();
      
      if (studentDoc.exists) {
        const studentData = studentDoc.data();
        console.log('✅ Found student in V2 architecture');
        
        // Verify class code through class document
        if (!studentData.classId) {
          throw new Error('Student missing classId (V2)');
        }
        
        const classRef = db.collection('classes').doc(studentData.classId);
        const classDoc = await classRef.get();
        
        if (!classDoc.exists) {
          throw new Error('Class not found (V2)');
        }
        
        const classData = classDoc.data();
        if ((classData.classCode || '').toUpperCase() !== (classCode || '').toUpperCase()) {
          throw new Error(`Invalid class code (V2)`);
        }
        
        // Check if student has a password set
        if (!studentData.passwordHash) {
          console.log('⚠️ Student has no password set, generating default...');
          
          // Generate default password: firstName + "123"
          const defaultPassword = (studentData.firstName || 'student').toLowerCase() + '123';
          const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10);
          
          // Update student with default password
          await studentRef.update({
            passwordHash: defaultPasswordHash,
            passwordLastUpdated: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          console.log('🔑 Generated default password for student');
          
          // Check if provided password matches default
          const passwordMatch = await bcrypt.compare(password, defaultPasswordHash);
          if (!passwordMatch) {
            return res.status(401).json({ 
              error: 'Invalid password',
              message: 'Your password is your first name followed by "123" (all lowercase). Ask your teacher if you need help.',
              suggestion: `Try: ${(studentData.firstName || 'student').toLowerCase()}123`
            });
          }
        } else {
          // Verify existing password
          const passwordMatch = await bcrypt.compare(password, studentData.passwordHash);
          if (!passwordMatch) {
            return res.status(401).json({ 
              error: 'Invalid password',
              message: 'Incorrect password. Please try again or ask your teacher for help.'
            });
          }
        }
        
        console.log('✅ V2 password verification successful');
        
        return res.status(200).json({
          success: true,
          schema: 'v2',
          studentId: studentId,
          message: 'Password verified successfully'
        });
      }
    } catch (v2Error) {
      console.log('⚠️ V2 verification failed:', v2Error.message);
    }

    // V1 fallback - scan user documents
    console.log('🔄 Falling back to V1 architecture...');
    
    const usersSnapshot = await db.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.classes && Array.isArray(userData.classes)) {
        
        for (const classData of userData.classes) {
          if (classData.classCode && 
              classData.classCode.toUpperCase() === classCode.toUpperCase() &&
              classData.students && Array.isArray(classData.students)) {
            
            const student = classData.students.find(s => s.id === studentId);
            if (student) {
              console.log('✅ Found student in V1 architecture');
              
              // Check if student has a password set
              if (!student.passwordHash) {
                console.log('⚠️ V1 student has no password set, generating default...');
                
                // Generate default password
                const defaultPassword = (student.firstName || 'student').toLowerCase() + '123';
                const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10);
                
                // Update student in nested array
                const updatedClasses = userData.classes.map(cls => {
                  if (cls.classCode && cls.classCode.toUpperCase() === classCode.toUpperCase()) {
                    return {
                      ...cls,
                      students: cls.students.map(s => {
                        if (s.id === studentId) {
                          return {
                            ...s,
                            passwordHash: defaultPasswordHash,
                            passwordLastUpdated: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                          };
                        }
                        return s;
                      })
                    };
                  }
                  return cls;
                });
                
                await db.collection('users').doc(userDoc.id).update({
                  classes: updatedClasses
                });
                
                console.log('🔑 Generated default password for V1 student');
                
                // Check if provided password matches default
                const passwordMatch = await bcrypt.compare(password, defaultPasswordHash);
                if (!passwordMatch) {
                  return res.status(401).json({ 
                    error: 'Invalid password',
                    message: 'Your password is your first name followed by "123" (all lowercase). Ask your teacher if you need help.',
                    suggestion: `Try: ${(student.firstName || 'student').toLowerCase()}123`
                  });
                }
              } else {
                // Verify existing password
                const passwordMatch = await bcrypt.compare(password, student.passwordHash);
                if (!passwordMatch) {
                  return res.status(401).json({ 
                    error: 'Invalid password',
                    message: 'Incorrect password. Please try again or ask your teacher for help.'
                  });
                }
              }
              
              console.log('✅ V1 password verification successful');
              
              return res.status(200).json({
                success: true,
                schema: 'v1',
                studentId: studentId,
                teacherId: userDoc.id,
                message: 'Password verified successfully'
              });
            }
          }
        }
      }
    }

    // Student not found
    return res.status(404).json({
      error: 'Student not found',
      message: 'Student not found in any class with the provided class code'
    });

  } catch (error) {
    console.error('❌ Password verification error:', error);
    
    return res.status(500).json({
      error: 'Password verification failed',
      message: 'An error occurred while verifying the password. Please try again.'
    });
  }
}