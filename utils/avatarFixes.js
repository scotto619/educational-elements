// utils/avatarFixes.js - FIXED EXPORTS VERSION

// ===============================================
// AVATAR IMAGE LOADING FUNCTION
// ===============================================

export const getAvatarImage = (avatarBase, level) => {
  // Handle missing or undefined avatarBase
  if (!avatarBase) {
    console.warn('No avatarBase provided, using default Wizard F');
    return '/Avatars/Wizard F/Level 1.png'; // Default fallback
  }
  
  // Ensure level is valid (1-4)
  const validLevel = Math.max(1, Math.min(level || 1, 4));
  
  // Construct the path - this should match your folder structure exactly
  const imagePath = `/Avatars/${avatarBase}/Level ${validLevel}.png`;
  
  console.log(`Loading avatar: ${avatarBase} Level ${validLevel} -> ${imagePath}`);
  
  return imagePath;
};

// ===============================================
// AVATAR LEVEL CALCULATION
// ===============================================

export const calculateAvatarLevel = (totalXP) => {
  if (totalXP >= 300) return 4;  // Level 4: 300+ XP
  if (totalXP >= 200) return 3;  // Level 3: 200-299 XP  
  if (totalXP >= 100) return 2;  // Level 2: 100-199 XP
  return 1;                      // Level 1: 0-99 XP
};

// ===============================================
// STUDENT DATA MIGRATION & FIXES
// ===============================================

export const migrateStudentData = (student) => {
  const totalXP = student.totalPoints || 0;
  const correctLevel = calculateAvatarLevel(totalXP);
  
  return {
    ...student,
    // Ensure all required fields exist
    id: student.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    firstName: student.firstName || 'Student',
    lastName: student.lastName || '',
    totalPoints: totalXP,
    currency: student.currency || 0, // Fix missing coins
    
    // Fix avatar data
    avatarLevel: correctLevel,
    avatarBase: student.avatarBase || 'Wizard F', // Default if missing
    avatar: getAvatarImage(student.avatarBase || 'Wizard F', correctLevel),
    
    // Ensure arrays exist
    ownedAvatars: student.ownedAvatars || (student.avatarBase ? [student.avatarBase] : ['Wizard F']),
    ownedPets: student.ownedPets || (student.pet ? [{
      id: `migrated_pet_${Date.now()}`,
      name: student.pet.name || 'Companion',
      image: student.pet.image,
      type: 'migrated'
    }] : []),
    rewardsPurchased: student.rewardsPurchased || [],
    
    // Quest and behavior tracking
    questsCompleted: student.questsCompleted || [],
    behaviorPoints: student.behaviorPoints || {
      respectful: 0,
      responsible: 0,
      safe: 0,
      learner: 0
    },
    
    // Timestamps
    createdAt: student.createdAt || new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
};

// ===============================================
// BULK STUDENT FIXES FUNCTION
// ===============================================

export const fixAllStudentLevels = (students, saveFunction) => {
  console.log('🔧 Starting student data fixes...');
  
  const fixedStudents = students.map(student => {
    const totalXP = student.totalPoints || 0;
    const correctLevel = calculateAvatarLevel(totalXP);
    
    // Fix avatar if it's missing or incorrect
    let fixedAvatarBase = student.avatarBase;
    if (!fixedAvatarBase) {
      // Assign a random avatar if missing
      const AVAILABLE_AVATARS = ['Wizard F', 'Wizard M', 'Knight F', 'Knight M', 'Archer F', 'Archer M'];
      fixedAvatarBase = AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)];
      console.log(`🎭 Assigned random avatar to ${student.firstName}: ${fixedAvatarBase}`);
    }
    
    const updatedStudent = migrateStudentData({
      ...student,
      avatarBase: fixedAvatarBase,
      avatarLevel: correctLevel,
      avatar: getAvatarImage(fixedAvatarBase, correctLevel)
    });
    
    // Log the fix
    if (student.avatarLevel !== correctLevel) {
      console.log(`📊 Fixed ${student.firstName}: ${totalXP} XP -> Level ${correctLevel} (was Level ${student.avatarLevel || 'undefined'})`);
    }
    
    return updatedStudent;
  });
  
  // Save the fixes
  if (saveFunction) {
    saveFunction(fixedStudents);
  }
  
  console.log('✅ Student data fixes complete!');
  return fixedStudents;
};