// components/shared/index.js - Reusable UI Components
// These components are used across multiple features and maintain consistent styling

import React, { useState, useEffect } from 'react';

// Try to import game data, fallback if not available
let RARITY_CONFIG = {};
try {
  const gameData = require('../../config/gameData');
  RARITY_CONFIG = gameData.RARITY_CONFIG || {};
} catch (error) {
  // Fallback rarity config if gameData not available
  RARITY_CONFIG = {
    common: { borderColor: 'border-gray-300', bgColor: 'bg-gray-50' },
    uncommon: { borderColor: 'border-green-300', bgColor: 'bg-green-50' },
    rare: { borderColor: 'border-blue-300', bgColor: 'bg-blue-50' },
    epic: { borderColor: 'border-purple-300', bgColor: 'bg-purple-50' },
    legendary: { borderColor: 'border-yellow-300', bgColor: 'bg-yellow-50' }
  };
}

// ===============================================
// BASIC UI COMPONENTS
// ===============================================

/**
 * Loading Spinner Component
 */
const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    green: 'border-green-200 border-t-green-600',
    purple: 'border-purple-200 border-t-purple-600',
    white: 'border-gray-200 border-t-white'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 ${colorClasses[color] || colorClasses.blue}`} />
  );
};

/**
 * Toast Notification Component
 */
const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg max-w-sm transform transition-all duration-300
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${typeStyles[type]}
    `}>
      <div className="flex items-center space-x-2">
        <span>{icons[type]}</span>
        <span className="font-medium">{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 text-lg hover:opacity-70"
        >
          ×
        </button>
      </div>
    </div>
  );
};

/**
 * Confirmation Dialog Component
 */
const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  onConfirm, 
  onCancel,
  type = 'default' // 'default', 'danger', 'warning'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    default: 'bg-blue-600 hover:bg-blue-700',
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${typeStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal Wrapper Component
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// ===============================================
// FORM COMPONENTS
// ===============================================

/**
 * Input Field Component
 */
const InputField = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '', 
  required = false,
  error = null,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * Select Field Component
 */
const SelectField = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select an option...',
  required = false,
  error = null,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * Textarea Field Component
 */
const TextareaField = ({ 
  label, 
  value, 
  onChange, 
  placeholder = '', 
  rows = 3,
  required = false,
  error = null,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          resize-none
        `}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// ===============================================
// BUTTON COMPONENTS
// ===============================================

/**
 * Primary Button Component
 */
const Button = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'success'
  size = 'md', // 'sm', 'md', 'lg'
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
    >
      {loading && <LoadingSpinner size="sm" color="white" />}
      <span>{children}</span>
    </button>
  );
};

/**
 * Icon Button Component
 */
const IconButton = ({ 
  icon, 
  onClick, 
  variant = 'ghost', // 'ghost', 'filled'
  size = 'md',
  disabled = false,
  className = '',
  tooltip = ''
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10',
    lg: 'w-12 h-12 text-lg'
  };

  const variants = {
    ghost: 'hover:bg-gray-100 text-gray-600 hover:text-gray-800',
    filled: 'bg-blue-600 hover:bg-blue-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        ${sizes[size]} ${variants[variant]}
        rounded-lg transition-all duration-200 flex items-center justify-center
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon}
    </button>
  );
};

// ===============================================
// GAME-SPECIFIC COMPONENTS
// ===============================================

/**
 * XP Badge Component
 */
const XPBadge = ({ amount, category, isAnimating = false }) => {
  const categoryColors = {
    Respectful: 'bg-green-500',
    Responsible: 'bg-blue-500',
    Learner: 'bg-purple-500',
    Participation: 'bg-yellow-500',
    Homework: 'bg-orange-500'
  };

  return (
    <div className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white
      ${categoryColors[category] || 'bg-gray-500'}
      ${isAnimating ? 'animate-pulse scale-110' : ''}
      transition-all duration-300
    `}>
      +{amount} {category}
    </div>
  );
};

/**
 * Enhanced Level Progress Bar Component - FIXED AND IMPROVED
 */
const LevelProgressBar = ({ 
  currentXP = 0, 
  currentLevel = 1, 
  showLabel = true,
  size = 'medium',
  animated = true,
  color = 'blue'
}) => {
  // Calculate XP thresholds (every 100 XP = 1 level)
  const xpPerLevel = 100;
  const maxLevel = 4;
  
  // Calculate current level progress
  const xpInCurrentLevel = currentXP % xpPerLevel;
  const progressPercentage = (xpInCurrentLevel / xpPerLevel) * 100;
  
  // Calculate next level XP requirement
  const xpToNextLevel = xpPerLevel - xpInCurrentLevel;
  const nextLevel = Math.min(currentLevel + 1, maxLevel);
  
  // Size variations
  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };
  
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  // Color variations
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-500',
          bgLight: 'bg-green-100',
          text: 'text-green-700'
        };
      case 'blue':
        return {
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-100',
          text: 'text-blue-700'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500',
          bgLight: 'bg-purple-100',
          text: 'text-purple-700'
        };
      case 'gold':
        return {
          bg: 'bg-yellow-500',
          bgLight: 'bg-yellow-100',
          text: 'text-yellow-700'
        };
      default:
        return {
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-100',
          text: 'text-blue-700'
        };
    }
  };

  const colors = getColorClasses();
  
  // Max level reached
  if (currentLevel >= maxLevel) {
    return (
      <div className="w-full">
        {showLabel && (
          <div className={`flex justify-between items-center mb-1 ${textSizeClasses[size]}`}>
            <span className="font-bold text-yellow-600">MAX LEVEL! 🏆</span>
            <span className="text-yellow-500 font-semibold">Level {currentLevel}</span>
          </div>
        )}
        <div className={`w-full ${sizeClasses[size]} bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full overflow-hidden relative shadow-inner`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse"></div>
        </div>
        {showLabel && (
          <div className={`text-center mt-1 ${textSizeClasses[size]} text-yellow-600 font-medium`}>
            Champion Status! ⭐
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex justify-between items-center mb-1 ${textSizeClasses[size]}`}>
          <span className={`font-bold ${colors.text}`}>
            Level {currentLevel}
          </span>
          <span className="text-gray-500 font-medium">
            {xpToNextLevel} XP to Level {nextLevel}
          </span>
        </div>
      )}
      
      <div className={`w-full ${sizeClasses[size]} ${colors.bgLight} rounded-full overflow-hidden relative shadow-inner`}>
        {/* Progress fill */}
        <div 
          className={`${sizeClasses[size]} ${colors.bg} rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''} relative overflow-hidden`}
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Animated shimmer effect */}
          {animated && progressPercentage > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
          )}
        </div>
        
        {/* XP text overlay for larger sizes */}
        {size !== 'small' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${textSizeClasses[size]} font-bold text-gray-700`}>
              {xpInCurrentLevel}/{xpPerLevel} XP
            </span>
          </div>
        )}
      </div>
      
      {/* Additional info for larger sizes */}
      {showLabel && size === 'large' && (
        <div className={`flex justify-between mt-1 ${textSizeClasses[size]} text-gray-600`}>
          <span>Total XP: {currentXP}</span>
          <span>{progressPercentage.toFixed(0)}% Complete</span>
        </div>
      )}
    </div>
  );
};

/**
 * Coin Display Component
 */
const CoinDisplay = ({ amount, size = 'md', showIcon = true }) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-bold'
  };

  return (
    <div className={`flex items-center space-x-1 text-yellow-600 ${sizes[size]}`}>
      {showIcon && <span>🪙</span>}
      <span>{amount.toLocaleString()}</span>
    </div>
  );
};

/**
 * Rarity Border Component
 */
const RarityBorder = ({ rarity, children, className = '' }) => {
  const rarityConfig = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  
  return (
    <div className={`
      ${rarityConfig.borderColor} ${rarityConfig.bgColor} 
      border-2 rounded-lg ${className}
    `}>
      {children}
    </div>
  );
};

/**
 * Achievement Badge Component
 */
const AchievementBadge = ({ achievement, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  return (
    <div 
      className={`
        ${sizes[size]} rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600
        flex items-center justify-center text-white font-bold shadow-lg
        hover:scale-110 transition-transform duration-200 cursor-pointer
      `}
      title={`${achievement.name}: ${achievement.description}`}
    >
      {achievement.icon}
    </div>
  );
};

// ===============================================
// LAYOUT COMPONENTS
// ===============================================

/**
 * Page Header Component
 */
const PageHeader = ({ 
  title, 
  subtitle = '', 
  actions = null, 
  breadcrumbs = [],
  className = ''
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="text-sm text-gray-500 mb-2">
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              {crumb.link ? (
                <button 
                  onClick={crumb.onClick}
                  className="hover:text-blue-600"
                >
                  {crumb.label}
                </button>
              ) : (
                crumb.label
              )}
              {index < breadcrumbs.length - 1 && ' / '}
            </span>
          ))}
        </nav>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Card Component
 */
const Card = ({ 
  title = '', 
  children, 
  actions = null,
  className = '',
  padding = 'md' // 'sm', 'md', 'lg'
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {(title || actions) && (
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  );
};

/**
 * Stats Card Component
 */
const StatsCard = ({ 
  title, 
  value, 
  icon, 
  change = null, 
  color = 'blue',
  onClick = null 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
    red: 'bg-red-50 text-red-700'
  };

  return (
    <div 
      className={`
        ${colorClasses[color]} rounded-xl p-6 shadow-md
        ${onClick ? 'cursor-pointer hover:shadow-lg transform hover:scale-105' : ''}
        transition-all duration-200
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-3xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Empty State Component
 */
const EmptyState = ({ 
  icon = '📭', 
  title = 'No items found', 
  description = '',
  action = null 
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && action}
    </div>
  );
};

// ===============================================
// EXPORT ALL COMPONENTS - FIXED!
// ===============================================

// Export all components (FIXED: Added missing exports)
export {
  // Basic UI Components
  LoadingSpinner,
  Toast,
  ConfirmDialog,
  Modal,
  
  // Form Components
  InputField,
  SelectField,
  TextareaField,
  
  // Button Components
  Button,
  IconButton,
  
  // Game-specific Components
  XPBadge,
  LevelProgressBar,  // ← THIS WAS MISSING! 
  CoinDisplay,
  RarityBorder,
  AchievementBadge,
  
  // Layout Components
  PageHeader,
  Card,
  StatsCard,
  EmptyState
};

// Default export for convenience
export default {
  LoadingSpinner,
  Toast,
  ConfirmDialog,
  Modal,
  InputField,
  SelectField,
  TextareaField,
  Button,
  IconButton,
  XPBadge,
  LevelProgressBar,
  CoinDisplay,
  RarityBorder,
  AchievementBadge,
  PageHeader,
  Card,
  StatsCard,
  EmptyState
};