// utils/errorHandling.js - PHASE 3: Centralized Error Handling & Toast System

import { playSound } from './gameUtils';

// ===============================================
// TOAST NOTIFICATION SYSTEM
// ===============================================

let toastContainer = null;

// Initialize toast container
const initializeToastContainer = () => {
  if (typeof window === 'undefined') return null;
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

// Create and show toast notification
export const showToast = (message, type = 'info', duration = 3000) => {
  const container = initializeToastContainer();
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `
    max-w-sm bg-white border-l-4 shadow-lg rounded-lg p-4 mb-2
    transform translate-x-full animate-slide-in-right
    ${getToastStyles(type)}
  `;

  const icon = getToastIcon(type);
  toast.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <span class="text-2xl">${icon}</span>
      </div>
      <div class="ml-3">
        <p class="text-sm font-medium text-gray-800">${message}</p>
      </div>
      <div class="ml-auto pl-3">
        <button class="toast-close text-gray-400 hover:text-gray-600">
          <span class="sr-only">Close</span>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  `;

  // Add close functionality
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => removeToast(toast));

  // Add to container
  container.appendChild(toast);

  // Play sound based on type
  playToastSound(type);

  // Auto-remove after duration
  setTimeout(() => removeToast(toast), duration);

  return toast;
};

const removeToast = (toast) => {
  if (toast && toast.parentNode) {
    toast.classList.add('animate-slide-out-right');
    setTimeout(() => {
      toast.parentNode.removeChild(toast);
    }, 300);
  }
};

const getToastStyles = (type) => {
  const styles = {
    info: 'border-blue-500 bg-blue-50',
    success: 'border-green-500 bg-green-50',
    warning: 'border-yellow-500 bg-yellow-50',
    error: 'border-red-500 bg-red-50'
  };
  return styles[type] || styles.info;
};

const getToastIcon = (type) => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  return icons[type] || icons.info;
};

const playToastSound = (type) => {
  const soundMap = {
    success: 'SUCCESS',
    error: 'ERROR',
    warning: 'ERROR',
    info: 'BUTTON_CLICK'
  };
  
  const soundType = soundMap[type] || 'BUTTON_CLICK';
  playSound(soundType, 0.3);
};

// ===============================================
// ERROR HANDLING UTILITIES
// ===============================================

export class AppError extends Error {
  constructor(message, type = 'GENERIC_ERROR', context = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  DATA_ERROR: 'DATA_ERROR',
  UI_ERROR: 'UI_ERROR',
  GENERIC_ERROR: 'GENERIC_ERROR'
};

export const handleError = (error, context = 'Unknown', showUserMessage = true) => {
  // Log error details
  console.error(`Error in ${context}:`, error);
  
  // Create error report
  const errorReport = {
    message: error.message || 'Unknown error occurred',
    type: error.type || ERROR_TYPES.GENERIC_ERROR,
    context,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location?.href : 'Unknown'
  };
  
  // Show user-friendly message
  if (showUserMessage) {
    const userMessage = getUserFriendlyMessage(error, context);
    showToast(userMessage, 'error', 5000);
  }
  
  // Send to logging service (implement as needed)
  sendErrorReport(errorReport);
  
  return errorReport;
};

const getUserFriendlyMessage = (error, context) => {
  // Map specific errors to user-friendly messages
  const errorMessages = {
    [ERROR_TYPES.NETWORK_ERROR]: 'Connection issue. Please check your internet and try again.',
    [ERROR_TYPES.VALIDATION_ERROR]: 'Please check your input and try again.',
    [ERROR_TYPES.AUTHENTICATION_ERROR]: 'Please log in again to continue.',
    [ERROR_TYPES.PERMISSION_ERROR]: 'You don\'t have permission to perform this action.',
    [ERROR_TYPES.DATA_ERROR]: 'There was a problem with your data. Please try again.',
    [ERROR_TYPES.UI_ERROR]: 'Something went wrong with the interface. Please refresh the page.'
  };
  
  // Check for specific error patterns
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return errorMessages[ERROR_TYPES.NETWORK_ERROR];
  }
  
  if (error.message?.includes('validation') || error.message?.includes('required')) {
    return errorMessages[ERROR_TYPES.VALIDATION_ERROR];
  }
  
  if (error.message?.includes('auth') || error.message?.includes('login')) {
    return errorMessages[ERROR_TYPES.AUTHENTICATION_ERROR];
  }
  
  // Return type-specific message or generic fallback
  return errorMessages[error.type] || `Oops! Something went wrong in ${context}. Please try again.`;
};

const sendErrorReport = (errorReport) => {
  // Implement error reporting service here
  // For now, just store in localStorage for debugging
  try {
    const errors = JSON.parse(localStorage.getItem('classroom_errors') || '[]');
    errors.push(errorReport);
    
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.splice(0, errors.length - 50);
    }
    
    localStorage.setItem('classroom_errors', JSON.stringify(errors));
  } catch (e) {
    console.warn('Could not store error report:', e);
  }
};

// ===============================================
// ERROR BOUNDARY UTILITIES
// ===============================================

export const withErrorBoundary = (component, fallbackComponent = null) => {
  return (props) => {
    try {
      return component(props);
    } catch (error) {
      handleError(error, component.name || 'Component');
      
      if (fallbackComponent) {
        return fallbackComponent(props, error);
      }
      
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-4">This component encountered an error. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      );
    }
  };
};

// ===============================================
// ASYNC ERROR HANDLING
// ===============================================

export const withAsyncErrorHandling = (asyncFunction, context = 'Async Function') => {
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      // Enhance error with context
      const enhancedError = new AppError(
        error.message || 'Async operation failed',
        determineErrorType(error),
        context
      );
      
      handleError(enhancedError, context);
      throw enhancedError;
    }
  };
};

const determineErrorType = (error) => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return ERROR_TYPES.NETWORK_ERROR;
  }
  
  if (error.name === 'ValidationError') {
    return ERROR_TYPES.VALIDATION_ERROR;
  }
  
  if (error.code === 'auth/invalid-user-token') {
    return ERROR_TYPES.AUTHENTICATION_ERROR;
  }
  
  if (error.code?.startsWith('permission-denied')) {
    return ERROR_TYPES.PERMISSION_ERROR;
  }
  
  return ERROR_TYPES.GENERIC_ERROR;
};

// ===============================================
// VALIDATION ERROR HELPERS
// ===============================================

export const createValidationError = (field, message) => {
  return new AppError(
    `${field}: ${message}`,
    ERROR_TYPES.VALIDATION_ERROR,
    { field, message }
  );
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw createValidationError(fieldName, 'This field is required');
  }
  return true;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createValidationError('Email', 'Please enter a valid email address');
  }
  return true;
};

export const validateRange = (value, min, max, fieldName) => {
  if (value < min || value > max) {
    throw createValidationError(fieldName, `Must be between ${min} and ${max}`);
  }
  return true;
};

// ===============================================
// SUCCESS NOTIFICATIONS
// ===============================================

export const showSuccessToast = (message, duration = 3000) => {
  return showToast(message, 'success', duration);
};

export const showWarningToast = (message, duration = 4000) => {
  return showToast(message, 'warning', duration);
};

export const showInfoToast = (message, duration = 3000) => {
  return showToast(message, 'info', duration);
};

export const showErrorToast = (message, duration = 5000) => {
  return showToast(message, 'error', duration);
};

// ===============================================
// DEBUG UTILITIES
// ===============================================

export const getStoredErrors = () => {
  try {
    return JSON.parse(localStorage.getItem('classroom_errors') || '[]');
  } catch (e) {
    return [];
  }
};

export const clearStoredErrors = () => {
  try {
    localStorage.removeItem('classroom_errors');
    showSuccessToast('Error log cleared');
  } catch (e) {
    console.warn('Could not clear stored errors:', e);
  }
};

// Add CSS for animations (inject into head)
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slide-in-right {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slide-out-right {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out forwards;
    }
    
    .animate-slide-out-right {
      animation: slide-out-right 0.3s ease-in forwards;
    }
  `;
  document.head.appendChild(style);
}