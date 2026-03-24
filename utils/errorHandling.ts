// utils/errorHandling.ts - Error Handling and Toast Utilities

// ── Error types ───────────────────────────────────────────────────────────────

export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  FIREBASE: 'FIREBASE',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  PERMISSION: 'PERMISSION',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorType = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];

export interface ClassifiedError {
  type: ErrorType;
  message: string;
  originalError: unknown;
  context: string;
}

// ── Classification ────────────────────────────────────────────────────────────

export const classifyError = (error: unknown): ErrorType => {
  if (!error) return ERROR_TYPES.UNKNOWN;

  const err = error as { message?: string; code?: string };
  const msg = err.message?.toLowerCase() ?? '';
  const code = err.code?.toLowerCase() ?? '';

  if (msg.includes('network') || msg.includes('offline')) return ERROR_TYPES.NETWORK;
  if (code.includes('auth') || msg.includes('authentication')) return ERROR_TYPES.AUTHENTICATION;
  if (code.includes('permission') || msg.includes('permission')) return ERROR_TYPES.PERMISSION;
  if (code.includes('firestore') || msg.includes('firestore')) return ERROR_TYPES.FIREBASE;

  return ERROR_TYPES.UNKNOWN;
};

// ── Main handler ──────────────────────────────────────────────────────────────

export const handleError = (
  error: unknown,
  context = 'Operation',
  showToast: ((msg: string, type: string) => void) | null = null
): ClassifiedError => {
  console.error(`Error in ${context}:`, error);

  const errorType = classifyError(error);
  const rawMessage = error instanceof Error ? error.message : undefined;
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
      userMessage = rawMessage ?? 'Invalid input. Please check your data.';
      break;
    default:
      userMessage = rawMessage ?? 'Something went wrong. Please try again.';
  }

  if (showToast) showToast(userMessage, 'error');

  return { type: errorType, message: userMessage, originalError: error, context };
};

// ── Async wrapper ─────────────────────────────────────────────────────────────

export const withAsyncErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  operation = 'operation'
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleError(error, operation);
    }
  };
};

// ── Toast stubs ───────────────────────────────────────────────────────────────

export const showToast = (message: string, type = 'info', duration = 5000): void => {
  console.log(`Toast [${type}] (${duration}ms): ${message}`);
};

export const showSuccessToast = (message: string, duration = 3000): void =>
  showToast(message, 'success', duration);

export const showErrorToast = (message: string, duration = 5000): void =>
  showToast(message, 'error', duration);

export const showWarningToast = (message: string, duration = 4000): void =>
  showToast(message, 'warning', duration);

export const showInfoToast = (message: string, duration = 3000): void =>
  showToast(message, 'info', duration);

// ── Validation ────────────────────────────────────────────────────────────────

export interface StudentData {
  firstName?: string;
  totalPoints?: number;
  currency?: number;
}

export const validateStudentData = (student: StudentData): true => {
  const errors: string[] = [];

  if (!student.firstName || student.firstName.trim().length === 0) {
    errors.push('First name is required');
  }
  if (student.firstName && student.firstName.length > 50) {
    errors.push('First name must be less than 50 characters');
  }
  if (student.totalPoints !== undefined && student.totalPoints < 0) {
    errors.push('Total points cannot be negative');
  }
  if (student.currency !== undefined && student.currency < 0) {
    errors.push('Currency cannot be negative');
  }

  if (errors.length > 0) throw new Error(errors.join(', '));
  return true;
};

export interface ClassData {
  name?: string;
  students?: unknown[];
}

export const validateClassData = (classData: ClassData): true => {
  const errors: string[] = [];

  if (!classData.name || classData.name.trim().length === 0) {
    errors.push('Class name is required');
  }
  if (classData.name && classData.name.length > 100) {
    errors.push('Class name must be less than 100 characters');
  }
  if (!Array.isArray(classData.students)) {
    errors.push('Students must be an array');
  }

  if (errors.length > 0) throw new Error(errors.join(', '));
  return true;
};

// ── Retry ─────────────────────────────────────────────────────────────────────

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

// ── Safe utilities ────────────────────────────────────────────────────────────

export const safeJSONParse = <T = unknown>(jsonString: string, fallback: T | null = null): T | null => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    console.warn('Failed to parse JSON');
    return fallback;
  }
};

export const safeArrayAccess = <T>(array: T[], index: number, fallback: T | null = null): T | null => {
  if (!Array.isArray(array) || index < 0 || index >= array.length) return fallback;
  return array[index];
};

export const safePropertyAccess = (
  obj: unknown,
  path: string,
  fallback: unknown = null
): unknown => {
  if (!obj || typeof obj !== 'object') return fallback;

  let current: unknown = obj;
  for (const key of path.split('.')) {
    if (current == null || typeof current !== 'object') return fallback;
    current = (current as Record<string, unknown>)[key];
    if (current === undefined || current === null) return fallback;
  }
  return current;
};

// ── Timing ────────────────────────────────────────────────────────────────────

export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  wait: number
): ((...args: T) => void) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends unknown[]>(
  func: (...args: T) => void,
  limit: number
): ((...args: T) => void) => {
  let inThrottle = false;
  return function (...args: T) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
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
  throttle,
};
