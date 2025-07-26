// utils/errorHandling.js - Error Handling and Toast Utilities
import React from 'react';

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  FIREBASE: 'FIREBASE',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  PERMISSION: 'PERMISSION',
  UNKNOWN: 'UNKNOWN'
};

// Error classification function
export const classifyError = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  
  if (errorMessage.includes('network') || errorMessage.includes('offline')) {
    return ERROR_TYPES.NETWORK;
  }
  
  if (errorCode.includes('auth') || errorMessage.includes('authentication')) {
    return ERROR_TYPES.AUTHENTICATION;
  }
  
  if (errorCode.includes('permission') || errorMessage.includes('permission')) {
    return ERROR_TYPES.PERMISSION;
  }
  
  if (errorCode.includes('firestore') || errorMessage.includes('firestore')) {
    return ERROR_TYPES.FIREBASE;
  }
  
  return ERROR_TYPES.UNKNOWN;
};

// Main error handler
export const handleError = (error, context = 'Operation', showToast = null) => {
  console.error(`Error in ${context}:`, error);
  
  const errorType = classifyError(error);
  let userMessage = 'An unexpected error occurred';
  
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      userMessage = 'Network error. Please check your connection and try again.';
      break;
    case ERROR_TYPES.AUTHENTICATION:
      userMessage = 'Authentication error. Please sign in again.';
      break;
    case ERROR_TYPES.PERMISSION:
      userMessage = 'Permission denied. You may not have access to this resource.';
      break;
    case ERROR_TYPES.FIREBASE:
      userMessage = 'Database error. Please try again later.';
      break;
    case ERROR_TYPES.VALIDATION:
      userMessage = error.message || 'Invalid input. Please check your data.';
      break;
    default:
      userMessage = error.message || 'Something went wrong. Please try again.';
  }
  
  if (showToast) {
    showToast(userMessage, 'error');
  }
  
  return {
    type: errorType,
    message: userMessage,
    originalError: error,
    context
  };
};

// Async error wrapper
export const withAsyncErrorHandling = (fn, operation = 'operation') => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleError(error, operation);
    }
  };
};

// Toast notification functions (can be used standalone)
export const showToast = (message, type = 'info', duration = 5000) => {
  // This would integrate with your toast system
  console.log(`Toast [${type}]: ${message}`);
};

export const showSuccessToast = (message, duration = 3000) => {
  showToast(message, 'success', duration);
};

export const showErrorToast = (message, duration = 5000) => {
  showToast(message, 'error', duration);
};

export const showWarningToast = (message, duration = 4000) => {
  showToast(message, 'warning', duration);
};

export const showInfoToast = (message, duration = 3000) => {
  showToast(message, 'info', duration);
};

// Validation utilities
export const validateStudentData = (student) => {
  const errors = [];
  
  if (!student.firstName || student.firstName.trim().length === 0) {
    errors.push('First name is required');
  }
  
  if (student.firstName && student.firstName.length > 50) {
    errors.push('First name must be less than 50 characters');
  }
  
  if (student.totalPoints && student.totalPoints < 0) {
    errors.push('Total points cannot be negative');
  }
  
  if (student.currency && student.currency < 0) {
    errors.push('Currency cannot be negative');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  return true;
};

export const validateClassData = (classData) => {
  const errors = [];
  
  if (!classData.name || classData.name.trim().length === 0) {
    errors.push('Class name is required');
  }
  
  if (classData.name && classData.name.length > 100) {
    errors.push('Class name must be less than 100 characters');
  }
  
  if (!Array.isArray(classData.students)) {
    errors.push('Students must be an array');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  return true;
};

// Retry mechanism for failed operations
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Safe JSON parsing
export const safeJSONParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
};

// Safe array access
export const safeArrayAccess = (array, index, fallback = null) => {
  if (!Array.isArray(array) || index < 0 || index >= array.length) {
    return fallback;
  }
  return array[index];
};

// Safe object property access
export const safePropertyAccess = (obj, path, fallback = null) => {
  if (!obj || typeof obj !== 'object') {
    return fallback;
  }
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      return fallback;
    }
    current = current[key];
  }
  
  return current;
};

// Debounce function for input handling
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export default {
  ERROR_TYPES,
  classifyError,
  handleError,
  withAsyncErrorHandling,
  showToast,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  validateStudentData,
  validateClassData,
  retryOperation,
  safeJSONParse,
  safeArrayAccess,
  safePropertyAccess,
  debounce,
  throttle
};