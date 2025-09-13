// utils/passwordHelpers.js - Direct password verification without APIs
import { firestore } from './firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Simple hash function for passwords (not cryptographically secure, but sufficient for student use)
function simpleHash(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

// Verify if a password matches
function verifyPassword(inputPassword, storedHash, defaultPassword) {
  // If no stored hash, check against default password
  if (!storedHash) {
    return inputPassword.toLowerCase() === defaultPassword.toLowerCase();
  }
  
  // Check against stored hash
  return simpleHash(inputPassword) === storedHash;
}

// Generate default password for a student
export function getDefaultPassword(firstName) {
  return (firstName || 'student').toLowerCase() + '123';
}

// Direct password verification (bypassing APIs completely)
export async function verifyStudentPasswordDirect(studentId, password, classCode) {
  try {
    console.log('🔐 Direct password verification for student:', studentId.substring(0, 10) + '...');
    
    // Try V2 architecture first
    try {
      const studentRef = doc(firestore, 'students', studentId);
      const studentDoc = await getDoc(studentRef);
      
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        console.log('✅ Found student in V2:', studentData.firstName);
        
        // Verify class code
        if (studentData.classId) {
          const classRef = doc(firestore, 'classes', studentData.classId);
          const classDoc = await getDoc(classRef);
          
          if (classDoc.exists()) {
            const classData = classDoc.data();
            if (classData.classCode?.toUpperCase() === classCode.toUpperCase()) {
              
              const defaultPassword = getDefaultPassword(studentData.firstName);
              const passwordMatch = verifyPassword(password, studentData.simplePasswordHash, defaultPassword);
              
              if (passwordMatch) {
                // Store the hash if it's a default password login
                if (!studentData.simplePasswordHash) {
                  await updateDoc(studentRef, {
                    simplePasswordHash: simpleHash(password),
                    passwordLastUpdated: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
                }
                
                console.log('✅ V2 password verified successfully');
                return { success: true, student: studentData, architecture: 'v2' };
              }
            }
          }
        }
      }
    } catch (v2Error) {
      console.log('⚠️ V2 verification failed, trying V1...');
    }
    
    // V1 fallback - scan user documents
    console.log('🔄 Trying V1 architecture...');
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.classes && Array.isArray(userData.classes)) {
        
        for (const classData of userData.classes) {
          if (classData.classCode?.toUpperCase() === classCode.toUpperCase() &&
              classData.students && Array.isArray(classData.students)) {
            
            const student = classData.students.find(s => s.id === studentId);
            if (student) {
              console.log('✅ Found student in V1:', student.firstName);
              
              const defaultPassword = getDefaultPassword(student.firstName);
              const passwordMatch = verifyPassword(password, student.simplePasswordHash, defaultPassword);
              
              if (passwordMatch) {
                // Store the hash if it's a default password login
                if (!student.simplePasswordHash) {
                  const updatedClasses = userData.classes.map(cls => {
                    if (cls.classCode?.toUpperCase() === classCode.toUpperCase()) {
                      return {
                        ...cls,
                        students: cls.students.map(s => {
                          if (s.id === studentId) {
                            return {
                              ...s,
                              simplePasswordHash: simpleHash(password),
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
                  
                  await updateDoc(doc(firestore, 'users', userDoc.id), { classes: updatedClasses });
                }
                
                console.log('✅ V1 password verified successfully');
                return { success: true, student: student, architecture: 'v1' };
              }
            }
          }
        }
      }
    }
    
    return { 
      success: false, 
      error: 'Invalid password', 
      message: 'Incorrect password. Please try again or ask your teacher for help.' 
    };
    
  } catch (error) {
    console.error('❌ Direct password verification error:', error);
    return { 
      success: false, 
      error: 'Verification failed', 
      message: 'Unable to verify password. Please try again.' 
    };
  }
}

// Direct password update (bypassing APIs)
export async function updateStudentPasswordDirect(studentId, newPassword, classCode, architectureVersion) {
  try {
    console.log('🔑 Direct password update for student:', studentId.substring(0, 10) + '...');
    
    const passwordHash = simpleHash(newPassword);
    const updateData = {
      simplePasswordHash: passwordHash,
      passwordLastUpdated: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (architectureVersion === 'v2') {
      // V2 update
      const studentRef = doc(firestore, 'students', studentId);
      const studentDoc = await getDoc(studentRef);
      
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        
        // Verify class code
        const classRef = doc(firestore, 'classes', studentData.classId);
        const classDoc = await getDoc(classRef);
        
        if (classDoc.exists()) {
          const classData = classDoc.data();
          if (classData.classCode?.toUpperCase() === classCode.toUpperCase()) {
            await updateDoc(studentRef, updateData);
            console.log('✅ V2 password updated successfully');
            return { success: true, architecture: 'v2' };
          }
        }
      }
    } else {
      // V1 update
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.classes && Array.isArray(userData.classes)) {
          
          const updatedClasses = userData.classes.map(classData => {
            if (classData.classCode?.toUpperCase() === classCode.toUpperCase() &&
                classData.students && Array.isArray(classData.students)) {
              
              const updatedStudents = classData.students.map(student => {
                if (student.id === studentId) {
                  return { ...student, ...updateData };
                }
                return student;
              });
              
              return { ...classData, students: updatedStudents };
            }
            return classData;
          });
          
          if (JSON.stringify(updatedClasses) !== JSON.stringify(userData.classes)) {
            await updateDoc(doc(firestore, 'users', userDoc.id), { classes: updatedClasses });
            console.log('✅ V1 password updated successfully');
            return { success: true, architecture: 'v1' };
          }
        }
      }
    }
    
    return { success: false, error: 'Student not found' };
    
  } catch (error) {
    console.error('❌ Direct password update error:', error);
    return { success: false, error: error.message };
  }
}