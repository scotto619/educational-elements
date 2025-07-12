// components/FullScreenImageViewer.js - Full Screen Image Display with Smooth Animations
import React, { useState, useEffect } from 'react';

const FullScreenImageViewer = ({ 
  src, 
  alt, 
  isVisible, 
  onClose,
  title,
  subtitle,
  showControls = true
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setImageLoaded(false);
      setIsClosing(false);
      // Prevent body scroll when viewer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      {/* Loading Spinner */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        </div>
      )}

      {/* Main Image Container */}
      <div 
        className={`relative max-w-[90vw] max-h-[90vh] transition-transform duration-300 ${
          isClosing ? 'scale-90' : imageLoaded ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          style={{ maxHeight: '85vh', maxWidth: '85vw' }}
        />

        {/* Image Info Overlay */}
        {imageLoaded && (title || subtitle) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent text-white p-6 rounded-b-xl">
            {title && (
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
            )}
            {subtitle && (
              <p className="text-lg text-gray-200">{subtitle}</p>
            )}
          </div>
        )}

        {/* Controls */}
        {showControls && imageLoaded && (
          <div className="absolute top-4 right-4 flex space-x-2">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
              title="Close (ESC)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Corner Decorations for Fantasy Theme */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-yellow-400 rounded-tl-xl opacity-70"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-yellow-400 rounded-tr-xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-yellow-400 rounded-bl-xl opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-yellow-400 rounded-br-xl opacity-70"></div>
      </div>

      {/* Instructions */}
      {imageLoaded && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-center">
          <p className="text-sm opacity-70">Click anywhere or press ESC to close</p>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
    </div>
  );
};

export default FullScreenImageViewer;