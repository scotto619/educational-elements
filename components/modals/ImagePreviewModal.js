// components/modals/ImagePreviewModal.js - Hover Image Preview System
import React, { useState, useEffect } from 'react';

const ImagePreviewModal = ({ 
  imageData = null, 
  position = { x: 0, y: 0 }, 
  isVisible = false,
  onClose = () => {} 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isVisible && imageData) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isVisible, imageData]);

  if (!isVisible || !imageData) return null;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Calculate optimal position to avoid going off-screen
  const getOptimalPosition = () => {
    const modalWidth = 200;
    const modalHeight = 250;
    const padding = 20;
    
    let x = position.x + 15; // Offset from cursor
    let y = position.y - (modalHeight / 2); // Center vertically on cursor
    
    // Adjust if going off right side of screen
    if (x + modalWidth > window.innerWidth - padding) {
      x = position.x - modalWidth - 15; // Show on left side instead
    }
    
    // Adjust if going off top of screen
    if (y < padding) {
      y = padding;
    }
    
    // Adjust if going off bottom of screen
    if (y + modalHeight > window.innerHeight - padding) {
      y = window.innerHeight - modalHeight - padding;
    }
    
    return { x, y };
  };

  const optimalPosition = getOptimalPosition();

  return (
    <div 
      className="fixed z-50 pointer-events-none animate-fade-in"
      style={{ 
        left: optimalPosition.x, 
        top: optimalPosition.y,
        zIndex: 9999
      }}
    >
      <div className="bg-white border-3 border-blue-300 rounded-xl shadow-2xl p-4 max-w-xs animate-scale-in">
        {/* Image Container */}
        <div className="relative">
          {!imageLoaded && !imageError && (
            <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
              <div className="text-gray-400 text-2xl">🖼️</div>
            </div>
          )}
          
          {imageError ? (
            <div className="w-40 h-40 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-red-600">
                <div className="text-2xl mb-1">❌</div>
                <div className="text-xs">Image failed to load</div>
              </div>
            </div>
          ) : (
            <img
              src={imageData.image || imageData.src}
              alt={imageData.name || imageData.alt || 'Preview'}
              className={`w-40 h-40 rounded-lg object-cover border-2 border-gray-200 transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {/* Type Badge */}
          {imageData.type && (
            <div className="absolute top-2 right-2">
              <span className={`
                px-2 py-1 rounded-full text-xs font-bold text-white
                ${imageData.type === 'avatar' ? 'bg-blue-500' : 
                  imageData.type === 'pet' ? 'bg-purple-500' : 
                  'bg-gray-500'}
              `}>
                {imageData.type === 'avatar' ? '👤' : imageData.type === 'pet' ? '🐾' : '❓'}
              </span>
            </div>
          )}
          
          {/* Rarity Badge */}
          {imageData.rarity && (
            <div className="absolute top-2 left-2">
              <span className={`
                px-2 py-1 rounded-full text-xs font-bold text-white
                ${imageData.rarity === 'common' ? 'bg-gray-500' :
                  imageData.rarity === 'uncommon' ? 'bg-green-500' :
                  imageData.rarity === 'rare' ? 'bg-blue-500' :
                  imageData.rarity === 'epic' ? 'bg-purple-500' :
                  imageData.rarity === 'legendary' ? 'bg-yellow-500' :
                  'bg-gray-400'}
              `}>
                {imageData.rarity}
              </span>
            </div>
          )}
          
          {/* Level Badge for Avatars */}
          {imageData.level && (
            <div className="absolute bottom-2 right-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                L{imageData.level}
              </span>
            </div>
          )}
        </div>
        
        {/* Info Section */}
        <div className="mt-3 text-center">
          <h3 className="font-bold text-gray-800 text-sm truncate">
            {imageData.name || 'Unknown'}
          </h3>
          
          {imageData.species && (
            <p className="text-xs text-gray-600 mt-1">
              Species: {imageData.species}
            </p>
          )}
          
          {imageData.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {imageData.description}
            </p>
          )}
          
          {/* Pet Stats */}
          {imageData.type === 'pet' && (
            <div className="flex justify-center space-x-2 mt-2">
              {imageData.speed && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
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
            <div className="flex justify-center space-x-2 mt-2">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                Level {imageData.level}
              </span>
            </div>
          )}
          
          {/* Price for Shop Items */}
          {imageData.price && (
            <div className="mt-2">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">
                💰 {imageData.price} coins
              </span>
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
    const rect = event.currentTarget.getBoundingClientRect();
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

// Utility component for easy hover preview integration
export const HoverPreviewImage = ({ 
  src, 
  alt, 
  className = '', 
  previewData = {},
  children,
  ...props 
}) => {
  const { showPreview, hidePreview } = useImagePreview();

  const handleMouseEnter = (event) => {
    const imageData = {
      image: src,
      name: alt,
      ...previewData
    };
    showPreview(imageData, event);
  };

  return (
    <div
      className={`cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={hidePreview}
      {...props}
    >
      {children || (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default ImagePreviewModal;