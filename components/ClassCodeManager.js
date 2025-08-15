// ===============================================
// PART 1: Updated ClassCodeManager.js
// ===============================================

// components/ClassCodeManager.js - IMPROVED with dedicated collection
import React, { useState } from 'react';
import { firestore } from '../utils/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

const ClassCodeManager = ({ 
  classData, 
  onUpdateClassCode, 
  showToast,
  userId, // Add userId prop
  currentClassId // Add currentClassId prop
}) => {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate a random class code
  const generateClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    const newCode = generateClassCode();
    
    try {
      // Update the class with the new code
      await onUpdateClassCode(newCode);
      
      // IMPROVED: Also store in dedicated classCodes collection
      await setDoc(doc(firestore, 'classCodes', newCode), {
        teacherId: userId,
        classId: currentClassId,
        className: classData?.name || 'Unnamed Class',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Remove old class code from classCodes collection if it exists
      if (classData?.classCode) {
        try {
          await deleteDoc(doc(firestore, 'classCodes', classData.classCode));
        } catch (error) {
          console.warn('Could not delete old class code:', error);
        }
      }
      
      showToast(`New class code generated: ${newCode}`, 'success');
    } catch (error) {
      console.error('Error generating class code:', error);
      showToast('Error generating class code', 'error');
    }
    
    setIsGenerating(false);
  };

  // Rest of the component remains the same...
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Class code copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy class code', 'error');
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join Our Classroom - Educational Elements');
    const body = encodeURIComponent(`Hi Students!

Join our classroom on Educational Elements using this class code:

🎯 Class Code: ${classData?.classCode || 'Not Set'}

Visit: [Your Website URL]/student

Enter the class code and select your name to access:
• Your personal dashboard
• Shop for avatars and pets
• Play educational games
• Join our quiz shows

Have fun learning!
${classData?.name || 'Your Teacher'}`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <>
      {/* Class Code Display Widget */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Student Portal Access</h3>
            <p className="text-sm text-gray-600">Share this code with your students</p>
          </div>
          <button
            onClick={() => setShowCodeModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            📱 Manage Code
          </button>
        </div>
        
        {classData?.classCode && (
          <div className="mt-3 flex items-center gap-3">
            <div className="bg-white rounded-lg px-4 py-2 border-2 border-green-300">
              <span className="text-2xl font-bold text-green-700 tracking-wider">
                {classData.classCode}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(classData.classCode)}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              📋 Copy
            </button>
          </div>
        )}
        
        {!classData?.classCode && (
          <div className="mt-3">
            <p className="text-orange-600 text-sm font-semibold">
              ⚠️ No class code set. Click "Manage Code" to generate one.
            </p>
          </div>
        )}
      </div>

      {/* Class Code Management Modal - Same as before but with better error handling */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">📱 Student Portal Access</h2>
              <p className="text-green-100">Manage your class code for student access</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Current Code Display */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Class Code
                </label>
                {classData?.classCode ? (
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-lg px-4 py-3 flex-1 text-center">
                      <span className="text-3xl font-bold text-gray-800 tracking-wider">
                        {classData.classCode}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(classData.classCode)}
                      className="bg-blue-500 text-white px-3 py-3 rounded-lg hover:bg-blue-600"
                    >
                      📋
                    </button>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-orange-700 text-center">No class code generated yet</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📚 How Students Use The Code:</h3>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Visit the student portal page</li>
                  <li>2. Enter this class code</li>
                  <li>3. Select their name from the list</li>
                  <li>4. Access their dashboard, shop, and games!</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleGenerateCode}
                  disabled={isGenerating}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : classData?.classCode ? '🔄 Generate New Code' : '✨ Generate Class Code'}
                </button>
                
                {classData?.classCode && (
                  <button
                    onClick={shareViaEmail}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
                  >
                    📧 Share via Email
                  </button>
                )}
              </div>

              {/* Warning for regenerating */}
              {classData?.classCode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-700 text-sm">
                    ⚠️ <strong>Note:</strong> Generating a new code will invalidate the current code. 
                    Students will need to use the new code to access the portal.
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 p-6 pt-0">
              <button 
                onClick={() => setShowCodeModal(false)} 
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClassCodeManager;

// ===============================================
// PART 2: Improved Student Portal with classCodes collection lookup
// ===============================================

// Add this to the student portal's handleClassCodeSubmit function:

const handleClassCodeSubmitImproved = async (e) => {
  e.preventDefault();
  if (!classCode.trim()) {
    setError('Please enter a class code');
    return;
  }

  setLoading(true);
  setError('');

  try {
    console.log('🔍 Searching for class code:', classCode.trim());
    
    // APPROACH 1: Try dedicated classCodes collection first (RECOMMENDED)
    try {
      const classCodeRef = doc(firestore, 'classCodes', classCode.trim().toUpperCase());
      const classCodeSnap = await getDoc(classCodeRef);
      
      if (classCodeSnap.exists()) {
        const classCodeData = classCodeSnap.data();
        console.log('✅ Found class code in dedicated collection');
        
        // Get the teacher's full data
        const teacherRef = doc(firestore, 'users', classCodeData.teacherId);
        const teacherSnap = await getDoc(teacherRef);
        
        if (teacherSnap.exists()) {
          const teacherData = teacherSnap.data();
          const foundClass = teacherData.classes.find(cls => cls.id === classCodeData.classId);
          
          if (foundClass && foundClass.students && foundClass.students.length > 0) {
            console.log('✅ Class found with', foundClass.students.length, 'students');
            setAvailableStudents(foundClass.students);
            setClassData(foundClass);
            setTeacherUserId(classCodeData.teacherId);
            setLoading(false);
            return;
          }
        }
      }
    } catch (classCodeError) {
      console.warn('⚠️ classCodes collection not available, falling back to user search:', classCodeError);
    }
    
    // APPROACH 2: Fallback to original method if classCodes collection doesn't work
    console.log('🔄 Falling back to user collection search...');
    
    const usersRef = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    let foundClass = null;
    let foundTeacherUserId = null;

    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data();
        
        if (userData.classes && Array.isArray(userData.classes)) {
          const matchingClass = userData.classes.find(cls => 
            cls.classCode && cls.classCode.trim().toUpperCase() === classCode.trim().toUpperCase()
          );
          
          if (matchingClass) {
            console.log('🎯 Found matching class!', matchingClass.name);
            foundClass = matchingClass;
            foundTeacherUserId = userDoc.id;
            break;
          }
        }
      } catch (userError) {
        console.warn('⚠️ Error processing user document:', userDoc.id, userError);
      }
    }

    if (!foundClass) {
      setError('Class code not found. Please check with your teacher and make sure the code is correct.');
      setLoading(false);
      return;
    }

    if (!foundClass.students || foundClass.students.length === 0) {
      setError('This class has no students yet. Please check with your teacher.');
      setLoading(false);
      return;
    }

    setAvailableStudents(foundClass.students);
    setClassData(foundClass);
    setTeacherUserId(foundTeacherUserId);
    
  } catch (error) {
    console.error('💥 Unexpected error finding class:', error);
    
    if (error.code === 'permission-denied') {
      setError('Access denied. Please check your internet connection and try again.');
    } else if (error.code === 'unavailable') {
      setError('Service temporarily unavailable. Please try again in a moment.');
    } else {
      setError('Unable to connect to class. Please check your internet connection and try again.');
    }
  }

  setLoading(false);
};

// ===============================================
// PART 3: Update the DashboardTab to pass required props
// ===============================================

// In classroom-champions.js, update the DashboardTab call:
/*
case 'dashboard':
  return <DashboardTab 
            students={students}
            showToast={showToast}
            getAvatarImage={getAvatarImage}
            getPetImage={getPetImage}
            calculateCoins={calculateCoins}
            calculateAvatarLevel={calculateAvatarLevel}
            SHOP_BASIC_AVATARS={SHOP_BASIC_AVATARS}
            SHOP_PREMIUM_AVATARS={SHOP_PREMIUM_AVATARS}
            SHOP_BASIC_PETS={SHOP_BASIC_PETS}
            SHOP_PREMIUM_PETS={SHOP_PREMIUM_PETS}
            currentClassData={getCurrentClassData()}
            updateClassCode={updateClassCode}
            // ADD THESE NEW PROPS:
            userId={user?.uid}
            currentClassId={currentClassId}
          />;
*/