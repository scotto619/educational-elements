// pages/api/apply-discount-code.js - Handle LAUNCH2025 discount code
import { adminAuth, adminFirestore } from '../../utils/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { discountCode, userEmail, userId } = req.body;

    // Validate required fields
    if (!discountCode || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Discount code and user ID are required' 
      });
    }

    // Validate the discount code
    const validDiscountCodes = {
      'LAUNCH2025': {
        type: 'free_access',
        description: 'Free access until January 1, 2026',
        expiresAt: '2026-01-01T23:59:59.999Z',
        maxUses: null, // Unlimited for launch promotion
        active: true
      }
    };

    const code = discountCode.toUpperCase();
    const discountInfo = validDiscountCodes[code];

    if (!discountInfo || !discountInfo.active) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired discount code' 
      });
    }

    // Check if user exists and hasn't already used this code
    const userRef = adminFirestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();

    // Check if user already has this discount applied
    if (userData.discountCodeUsed === code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Discount code has already been applied to this account' 
      });
    }

    // Check if user already has an active subscription
    if (userData.subscription && userData.subscription !== 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot apply discount code to an account with an active subscription' 
      });
    }

    // Apply the discount code
    const updateData = {
      discountCodeUsed: code,
      freeAccessUntil: discountInfo.expiresAt,
      discountAppliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If they have a cancelled subscription, we can still give them free access
    if (userData.subscription === 'cancelled') {
      updateData.subscription = null; // Clear cancelled status
    }

    await userRef.update(updateData);

    // Log the discount code usage for analytics
    await adminFirestore.collection('discount_code_usage').add({
      userId: userId,
      userEmail: userEmail || userData.email,
      discountCode: code,
      appliedAt: new Date().toISOString(),
      expiresAt: discountInfo.expiresAt,
      type: discountInfo.type
    });

    console.log(`✅ Applied discount code ${code} to user ${userId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Discount code applied successfully!',
      freeAccessUntil: discountInfo.expiresAt,
      description: discountInfo.description
    });

  } catch (error) {
    console.error('Error applying discount code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to apply discount code. Please try again.' 
    });
  }
}

// Helper function to check if a discount code is valid (can be called from other places)
export async function validateDiscountCode(code) {
  const validDiscountCodes = {
    'LAUNCH2025': {
      type: 'free_access',
      description: 'Free access until January 1, 2026',
      expiresAt: '2026-01-31T23:59:59.999Z',
      maxUses: null,
      active: true
    }
  };

  const discountInfo = validDiscountCodes[code.toUpperCase()];
  
  if (!discountInfo || !discountInfo.active) {
    return { valid: false, message: 'Invalid discount code' };
  }

  // Check if code has expired
  if (discountInfo.expiresAt && new Date() > new Date(discountInfo.expiresAt)) {
    return { valid: false, message: 'Discount code has expired' };
  }

  // Check usage limits if applicable
  if (discountInfo.maxUses) {
    const usageCount = await adminFirestore.collection('discount_code_usage')
      .where('discountCode', '==', code.toUpperCase())
      .count()
      .get();

    if (usageCount.data().count >= discountInfo.maxUses) {
      return { valid: false, message: 'Discount code usage limit reached' };
    }
  }

  return { 
    valid: true, 
    discountInfo: discountInfo 
  };
}