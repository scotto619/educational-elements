// components/modals/ImagePreviewModal.js - Simple Hover Preview System
import React, { useState } from 'react';

const ImagePreviewModal = ({ 
  imageData = null, 
  position = { x: 0, y: 0 }, 
  isVisible = false,
  onClose = () => {} 
}) => {
  if (!isVisible || !imageData) return null;

  // Calculate optimal position to avoid going off-screen
  const getOptimalPosition = () => {
    const modalWidth = 200;
    const modalHeight = 250;
    const padding = 20;
    
    let x = position.x + 15; // Offset from cursor
    let y = position.y - (modalHeight / 2); // Center vertically on cursor
    
    // Adjust if going off right side of screen
    if (typeof window !== 'undefined' && x + modalWidth > window.innerWidth - padding) {
      x = position.x - modalWidth - 15; // Show on left side instead
    }
    
    // Adjust if going off top of screen
    if (y < padding) {
      y = padding;
    }
    
    // Adjust if going off bottom of screen
    if (typeof window !== 'undefined' && y + modalHeight > window.innerHeight - padding) {
      y = window.innerHeight - modalHeight - padding;
    }
    
    return { x, y };
  };

  const optimalPosition = getOptimalPosition();

  return (
    <div 
      className="fixed z-50 pointer-events-none"
      style={{ 
        left: optimalPosition.x, 
        top: optimalPosition.y,
        zIndex: 9999
      }}
    >
      <div className="bg-white border-3 border-blue-300 rounded-xl shadow-2xl p-4 max-w-xs animate-fade-in">
        {/* Image Container */}
        <div className="relative">
          <img
            src={imageData.image || imageData.src}
            alt={imageData.name || imageData.alt || 'Preview'}
            className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 mx-auto"
            onError={(e) => {
              e.target.src = '/Avatars/Wizard F/Level 1.png'; // Fallback
            }}
          />
        </div>
        
        {/* Preview Info */}
        <div className="text-center mt-3">
          <div className="font-bold text-gray-800 text-sm">
            {imageData.name || 'Preview'}
          </div>
          
          {/* Type-specific info */}
          {imageData.type === 'pet' && (
            <div className="flex justify-center space-x-2 mt-1">
              {imageData.species && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {imageData.species}
                </span>
              )}
              {imageData.speed && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                  Speed: {imageData.speed}
                </span>
              )}
              {imageData.wins !== undefined && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Wins: {imageData.wins}
                </span>
              )}
            </div>
          )}
          
          {/* Avatar Stats */}
          {imageData.type === 'avatar' && imageData.level && (
            <div className="flex justify-center space-x-2 mt-1">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                Level {imageData.level}
              </span>
            </div>
          )}
          
          {/* Owner info */}
          {imageData.owner && (
            <div className="text-xs text-gray-600 mt-1">
              {imageData.owner}'s Pet
            </div>
          )}
          
          {/* Description */}
          {imageData.description && (
            <div className="text-xs text-gray-600 mt-1">
              {imageData.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for managing image preview state
export const useImagePreview = () => {
  const [previewData, setPreviewData] = useState(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const showPreview = (imageData, event) => {
    setPreviewPosition({
      x: event.clientX,
      y: event.clientY
    });
    setPreviewData(imageData);
    setIsVisible(true);
  };

  const hidePreview = () => {
    setIsVisible(false);
    // Delay clearing data to allow exit animation
    setTimeout(() => {
      setPreviewData(null);
    }, 200);
  };

  const updatePosition = (event) => {
    if (isVisible) {
      setPreviewPosition({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  return {
    previewData,
    previewPosition,
    isVisible,
    showPreview,
    hidePreview,
    updatePosition,
    PreviewComponent: () => (
      <ImagePreviewModal
        imageData={previewData}
        position={previewPosition}
        isVisible={isVisible}
        onClose={hidePreview}
      />
    )
  };
};

export default ImagePreviewModal;