// components/HoverImageViewer.js - Reusable Component for Hover-to-View Images
import React, { useState, useRef } from 'react';
import FullScreenImageViewer from './FullScreenImageViewer';

const HoverImageViewer = ({ 
  children, 
  imageSrc, 
  title, 
  subtitle, 
  hoverDelay = 500,
  showHoverIndicator = true,
  indicatorPosition = 'center', // center, top-right, bottom-right, etc.
  disabled = false
}) => {
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (disabled || !imageSrc) return;
    
    setIsHovering(true);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setFullScreenImage({
        src: imageSrc,
        title,
        subtitle
      });
    }, hoverDelay);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const getIndicatorClasses = () => {
    const baseClasses = "absolute pointer-events-none flex items-center justify-center transition-all duration-300";
    const positionClasses = {
      'center': 'inset-0',
      'top-right': 'top-2 right-2',
      'bottom-right': 'bottom-2 right-2',
      'top-left': 'top-2 left-2',
      'bottom-left': 'bottom-2 left-2'
    };
    
    return `${baseClasses} ${positionClasses[indicatorPosition] || positionClasses.center}`;
  };

  return (
    <>
      <div 
        className="relative group cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        
        {/* Hover Indicator */}
        {showHoverIndicator && !disabled && imageSrc && (
          <div className={getIndicatorClasses()}>
            <div className={`
              text-white text-sm font-bold bg-black bg-opacity-50 px-2 py-1 rounded
              transition-opacity duration-300
              ${isHovering ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}>
              {indicatorPosition === 'center' ? (
                <span className="flex items-center space-x-1">
                  <span>🔍</span>
                  <span>Full View</span>
                </span>
              ) : (
                <span>🔍</span>
              )}
            </div>
          </div>
        )}

        {/* Subtle overlay effect on hover */}
        {!disabled && imageSrc && (
          <div className={`
            absolute inset-0 bg-blue-500 bg-opacity-0 transition-all duration-300 rounded
            ${isHovering ? 'bg-opacity-10' : 'group-hover:bg-opacity-10'}
          `} />
        )}
      </div>

      {/* Full Screen Image Viewer */}
      <FullScreenImageViewer
        src={fullScreenImage?.src}
        alt={fullScreenImage?.title || 'Image'}
        title={fullScreenImage?.title}
        subtitle={fullScreenImage?.subtitle}
        isVisible={!!fullScreenImage}
        onClose={closeFullScreen}
      />
    </>
  );
};

export default HoverImageViewer;