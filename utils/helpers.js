// utils/helpers.js - Common utility functions
// This file should be in the utils/ directory in your project root

// ===============================================
// DATE AND TIME UTILITIES
// ===============================================

export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Date(date).toLocaleDateString(undefined, defaultOptions);
  } catch {
    return '';
  }
};

export const formatTime = (date) => {
  if (!date) return '';
  
  try {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now - then) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    
    return formatDate(date);
  } catch {
    return '';
  }
};

// ===============================================
// STRING UTILITIES
// ===============================================

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const generateId = (prefix = 'item') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ===============================================
// PERFORMANCE UTILITIES
// ===============================================

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

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// ===============================================
// ARRAY AND OBJECT UTILITIES
// ===============================================

export const arrayMove = (arr, fromIndex, toIndex) => {
  const element = arr[fromIndex];
  const newArr = [...arr];
  newArr.splice(fromIndex, 1);
  newArr.splice(toIndex, 0, element);
  return newArr;
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    let aVal = typeof key === 'function' ? key(a) : key.split('.').reduce((obj, k) => obj?.[k], a);
    let bVal = typeof key === 'function' ? key(b) : key.split('.').reduce((obj, k) => obj?.[k], b);
    
    // Handle different data types
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
};

export const filterBySearch = (items, searchTerm, searchFields = ['name', 'title']) => {
  if (!searchTerm) return items;
  
  const term = searchTerm.toLowerCase();
  return items.filter(item => 
    searchFields.some(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};

export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// ===============================================
// VALIDATION UTILITIES
// ===============================================

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateStudentName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return !value || value.toString().length <= maxLength;
};

export const validateNumber = (value, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

// ===============================================
// DATA UTILITIES
// ===============================================

export const safeParseJSON = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

export const isEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => isEqual(val, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => isEqual(a[key], b[key]));
  }
  return false;
};

// ===============================================
// BROWSER UTILITIES
// ===============================================

export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch {
    return false;
  }
};

export const downloadJSON = (data, filename = 'data.json') => {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
};

export const downloadCSV = (data, filename = 'data.csv', headers = null) => {
  try {
    let csv = '';
    
    // Add headers if provided
    if (headers) {
      csv += headers.join(',') + '\n';
    } else if (data.length > 0) {
      // Use object keys as headers
      csv += Object.keys(data[0]).join(',') + '\n';
    }
    
    // Add data rows
    data.forEach(row => {
      const values = Object.values(row).map(value => {
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
};

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

// ===============================================
// LOCAL STORAGE UTILITIES
// ===============================================

export const localStorage = {
  get: (key, defaultValue = null) => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove: (key) => {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: () => {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
};

// ===============================================
// ANIMATION UTILITIES
// ===============================================

export const animateValue = (start, end, duration, callback) => {
  let startTime = null;
  
  const animate = (currentTime) => {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOutCubic(progress);
    
    const currentValue = start + (end - start) * easedProgress;
    callback(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};

export const slideIn = (element, direction = 'left', duration = 300) => {
  if (!element) return;
  
  const directions = {
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
    up: 'translateY(-100%)',
    down: 'translateY(100%)'
  };

  element.style.transform = directions[direction];
  element.style.opacity = '0';
  element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
  
  requestAnimationFrame(() => {
    element.style.transform = 'translate(0, 0)';
    element.style.opacity = '1';
  });
};

// ===============================================
// ASYNC UTILITIES
// ===============================================

export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const timeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
};

export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ===============================================
// VALIDATION SCHEMAS
// ===============================================

export const validationRules = {
  student: {
    firstName: (value) => {
      if (!validateRequired(value)) return 'First name is required';
      if (!validateMinLength(value.trim(), 2)) return 'First name must be at least 2 characters';
      if (!validateMaxLength(value.trim(), 50)) return 'First name must be less than 50 characters';
      if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) return 'First name can only contain letters, spaces, hyphens, and apostrophes';
      return null;
    },
    lastName: (value) => {
      if (value && !validateMaxLength(value.trim(), 50)) return 'Last name must be less than 50 characters';
      if (value && !/^[a-zA-Z\s\-']+$/.test(value.trim())) return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
      return null;
    }
  },

  quest: {
    title: (value) => {
      if (!validateRequired(value)) return 'Quest title is required';
      if (!validateMinLength(value.trim(), 3)) return 'Quest title must be at least 3 characters';
      if (!validateMaxLength(value.trim(), 100)) return 'Quest title must be less than 100 characters';
      return null;
    },
    description: (value) => {
      if (!validateRequired(value)) return 'Quest description is required';
      if (!validateMinLength(value.trim(), 10)) return 'Quest description must be at least 10 characters';
      if (!validateMaxLength(value.trim(), 500)) return 'Quest description must be less than 500 characters';
      return null;
    },
    xpReward: (value) => {
      if (!validateNumber(value, 1, 100)) return 'XP reward must be between 1 and 100';
      return null;
    }
  },

  class: {
    name: (value) => {
      if (!validateRequired(value)) return 'Class name is required';
      if (!validateMinLength(value.trim(), 2)) return 'Class name must be at least 2 characters';
      if (!validateMaxLength(value.trim(), 50)) return 'Class name must be less than 50 characters';
      return null;
    }
  },

  email: (value) => {
    if (!validateRequired(value)) return 'Email is required';
    if (!validateEmail(value)) return 'Please enter a valid email address';
    return null;
  }
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  for (const [field, value] of Object.entries(data)) {
    if (rules[field]) {
      const error = rules[field](value);
      if (error) errors[field] = error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===============================================
// URL AND ROUTING UTILITIES
// ===============================================

export const getUrlParams = () => {
  if (typeof window === 'undefined') return {};
  return Object.fromEntries(new URLSearchParams(window.location.search));
};

export const setUrlParam = (key, value) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.pushState({}, '', url);
};

export const removeUrlParam = (key) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location);
  url.searchParams.delete(key);
  window.history.pushState({}, '', url);
};

// ===============================================
// EXPORT ALL UTILITIES
// ===============================================

export default {
  // Date & Time
  formatDate,
  formatTime,
  formatRelativeTime,
  
  // Strings
  capitalizeFirst,
  truncateText,
  generateId,
  slugify,
  
  // Performance
  debounce,
  throttle,
  memoize,
  
  // Arrays & Objects
  arrayMove,
  groupBy,
  sortBy,
  filterBySearch,
  uniqueBy,
  deepClone,
  isEqual,
  
  // Validation
  validateEmail,
  validateStudentName,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumber,
  validationRules,
  validateForm,
  
  // Data
  safeParseJSON,
  
  // Browser
  copyToClipboard,
  downloadJSON,
  downloadCSV,
  readFileAsText,
  localStorage,
  
  // Animation
  animateValue,
  slideIn,
  
  // Async
  withRetry,
  timeout,
  delay,
  
  // URL
  getUrlParams,
  setUrlParam,
  removeUrlParam
};