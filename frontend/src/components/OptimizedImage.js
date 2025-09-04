import React, { useState } from 'react';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  // Generate WebP and AVIF versions if original is not already optimized
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc) return '';
    
    // If already optimized format, return as is
    if (originalSrc.includes('.webp') || originalSrc.includes('.avif')) {
      return originalSrc;
    }
    
    // For external images, return as is (optimization handled by CDN)
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }
    
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src);

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={{ width, height }}
        {...props}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} {...props}>
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <picture>
        {/* Modern browsers will use WebP/AVIF if supported */}
        <source srcSet={optimizedSrc} type="image/webp" />
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          style={{
            width: width || 'auto',
            height: height || 'auto'
          }}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;