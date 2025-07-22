// ===============================================
// UTILITY FUNCTIONS
// ===============================================

// utils/helpers.js - Common utility functions
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString(undefined, defaultOptions);
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date) => {
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
};

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

export const arrayMove = (arr, fromIndex, toIndex) => {
  const element = arr[fromIndex];
  const newArr = [...arr];
  newArr.splice(fromIndex, 1);
  newArr.splice(toIndex, 0, element);
  return newArr;
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const value = item[key];
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    let aVal = key.split('.').reduce((obj, k) => obj?.[k], a);
    let bVal = key.split('.').reduce((obj, k) => obj?.[k], b);
    
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

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateStudentName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

export const safeParseJSON = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

export const downloadJSON = (data, filename = 'data.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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
// PERFORMANCE UTILITIES
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
// VALIDATION SCHEMAS
// ===============================================

export const validationRules = {
  student: {
    firstName: (value) => {
      if (!value || value.trim().length < 2) return 'First name must be at least 2 characters';
      if (value.trim().length > 50) return 'First name must be less than 50 characters';
      if (!/^[a-zA-Z\s-']+$/.test(value)) return 'First name can only contain letters, spaces, hyphens, and apostrophes';
      return null;
    },
    lastName: (value) => {
      if (value && value.trim().length > 50) return 'Last name must be less than 50 characters';
      if (value && !/^[a-zA-Z\s-']+$/.test(value)) return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
      return null;
    }
  },

  quest: {
    title: (value) => {
      if (!value || value.trim().length < 3) return 'Quest title must be at least 3 characters';
      if (value.trim().length > 100) return 'Quest title must be less than 100 characters';
      return null;
    },
    description: (value) => {
      if (!value || value.trim().length < 10) return 'Quest description must be at least 10 characters';
      if (value.trim().length > 500) return 'Quest description must be less than 500 characters';
      return null;
    },
    xpReward: (value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1) return 'XP reward must be at least 1';
      if (num > 100) return 'XP reward must be less than 100';
      return null;
    }
  },

  class: {
    name: (value) => {
      if (!value || value.trim().length < 2) return 'Class name must be at least 2 characters';
      if (value.trim().length > 50) return 'Class name must be less than 50 characters';
      return null;
    }
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

// Export everything as default
