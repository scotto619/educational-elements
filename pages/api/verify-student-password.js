// pages/api/verify-student-password.js - FIXED VERSION
import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';

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

    console.log('✅ Firebase Admin SDK initialized for password verification');
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
    console.log('🔍 Trying V2 architecture...');
    try {
      const studentRef = db.collection('students').doc(studentId);
      const studentDoc = await studentRef.get();
      
      if (studentDoc.exists) {
        const studentData = studentDoc.data();
        console.log('✅ Found student in V2:', studentData.firstName);
        
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
          throw new Error(`Invalid class code (V2). Expected: ${classData.classCode}, Got: ${classCode}`);
        }
        
        // FIXED: Password verification logic
        let passwordMatch = false;
        
        if (!studentData.passwordHash) {
          // No custom password set - check against default password (firstName + "123")
          const defaultPassword = (studentData.firstName || 'student').toLowerCase() + '123';
          console.log('🔑 Checking against default password for:', studentData.firstName);
          passwordMatch = (password.toLowerCase() === defaultPassword);
          
          if (passwordMatch) {
            console.log('✅ Default password verified');
            // Optionally create the hash for future use
            const passwordHash = await bcrypt.hash(password, 10);
            await studentRef.update({
              passwordHash: passwordHash,
              passwordLastUpdated: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        } else {
          // Custom password set - verify against hash
          console.log('🔑 Checking against custom password hash');
          passwordMatch = await bcrypt.compare(password, studentData.passwordHash);
        }
        
        if (!passwordMatch) {
          const defaultPassword = (studentData.firstName || 'student').toLowerCase() + '123';
          return res.status(401).json({ 
            error: 'Invalid password',
            message: `Incorrect password. ${!studentData.passwordHash ? `Try: ${defaultPassword}` : 'Please try again or ask your teacher for help.'}`
          });
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
    console.log('👥 Scanning', usersSnapshot.size, 'user documents');
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.classes && Array.isArray(userData.classes)) {
        
        for (const classData of userData.classes) {
          if (classData.classCode && 
              classData.classCode.toUpperCase() === classCode.toUpperCase() &&
              classData.students && Array.isArray(classData.students)) {
            
            const student = classData.students.find(s => s.id === studentId);
            if (student) {
              console.log('✅ Found student in V1:', student.firstName);
              
              // FIXED: Password verification logic for V1
              let passwordMatch = false;
              
              if (!student.passwordHash) {
                // No custom password - check against default
                const defaultPassword = (student.firstName || 'student').toLowerCase() + '123';
                console.log('🔑 V1: Checking against default password for:', student.firstName);
                passwordMatch = (password.toLowerCase() === defaultPassword);
                
                if (passwordMatch) {
                  console.log('✅ V1: Default password verified');
                  // Update V1 structure with password hash
                  const passwordHash = await bcrypt.hash(password, 10);
                  
                  const updatedClasses = userData.classes.map(cls => {
                    if (cls.classCode && cls.classCode.toUpperCase() === classCode.toUpperCase()) {
                      return {
                        ...cls,
                        students: cls.students.map(s => {
                          if (s.id === studentId) {
                            return {
                              ...s,
                              passwordHash: passwordHash,
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
                }
              } else {
                // Custom password - verify against hash
                console.log('🔑 V1: Checking against custom password hash');
                passwordMatch = await bcrypt.compare(password, student.passwordHash);
              }
              
              if (!passwordMatch) {
                const defaultPassword = (student.firstName || 'student').toLowerCase() + '123';
                return res.status(401).json({ 
                  error: 'Invalid password',
                  message: `Incorrect password. ${!student.passwordHash ? `Try: ${defaultPassword}` : 'Please try again or ask your teacher for help.'}`
                });
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
    console.log('❌ Student not found in any architecture');
    return res.status(404).json({
      error: 'Student not found',
      message: 'Student not found in any class with the provided class code'
    });

  } catch (error) {
    console.error('❌ Password verification error:', error);
    
    return res.status(500).json({
      error: 'Password verification failed',
      message: 'An error occurred while verifying the password. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}