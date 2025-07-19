// HoverImagePreview.js - Enlarged Image on Hover
import React, { useState, useRef } from 'react';

const HoverImagePreview = ({ 
  children, 
  imageSrc, 
  title, 
  subtitle,
  previewSize = 'large' // 'medium', 'large', 'xl'
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef(null);

  const sizeClasses = {
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  const handleMouseEnter = (e) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Small delay before showing preview to avoid flickering
    hoverTimeoutRef.current = setTimeout(() => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setShowPreview(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    // Clear timeout and hide preview
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowPreview(false);
  };

  const handleMouseMove = (e) => {
    if (showPreview) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Calculate preview position to keep it on screen
  const getPreviewStyle = () => {
    const previewWidth = previewSize === 'xl' ? 256 : previewSize === 'large' ? 192 : 128;
    const previewHeight = previewSize === 'xl' ? 256 : previewSize === 'large' ? 192 : 128;
    const padding = 20;
    
    let x = mousePosition.x + padding;
    let y = mousePosition.y + padding;

    // Adjust if preview would go off-screen
    if (x + previewWidth > window.innerWidth) {
      x = mousePosition.x - previewWidth - padding;
    }
    if (y + previewHeight > window.innerHeight) {
      y = mousePosition.y - previewHeight - padding;
    }

    // Ensure minimum distance from edges
    x = Math.max(padding, Math.min(x, window.innerWidth - previewWidth - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - previewHeight - padding));

    return {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      zIndex: 9999,
      pointerEvents: 'none'
    };
  };

  if (!imageSrc) {
    return children;
  }

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="cursor-pointer"
      >
        {children}
      </div>

      {/* Hover Preview */}
      {showPreview && (
        <div
          style={getPreviewStyle()}
          className="animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-xl shadow-2xl border-4 border-white overflow-hidden">
            <img
              src={imageSrc}
              alt={title || 'Preview'}
              className={`${sizeClasses[previewSize]} object-cover`}
            />
            {(title || subtitle) && (
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {title && (
                  <div className="font-bold text-sm">{title}</div>
                )}
                {subtitle && (
                  <div className="text-xs opacity-90">{subtitle}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default HoverImagePreview;