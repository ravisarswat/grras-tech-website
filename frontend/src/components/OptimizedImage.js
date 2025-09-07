import React, { useState, useEffect, useRef } from 'react';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  sizes = null,
  aspectRatio = null,
  placeholder = null,
  fallbackSrc = null,
  fetchPriority = 'auto',
  onLoad = null,
  onError = null,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : (placeholder || src));
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (loading === 'lazy' && !priority && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isLoaded) {
              setCurrentSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px 0px' }
      );

      observer.observe(imgRef.current);
      observerRef.current = observer;

      return () => observer.disconnect();
    }
  }, [src, loading, priority, isLoaded]);

  const handleLoad = (event) => {
    setIsLoaded(true);
    setHasError(false);
    if (onLoad) onLoad(event);
  };

  const handleError = (event) => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setHasError(true);
    if (onError) onError(event);
  };

  // Generate optimized source with responsive breakpoints
  const getOptimizedSrc = (originalSrc, targetWidth = null) => {
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

  // Generate srcSet for responsive images
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc || !width) return null;
    
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    return sizes
      .filter(size => size <= width * 2) // Don't generate sizes larger than 2x the display size
      .map(size => `${getOptimizedSrc(baseSrc, size)} ${size}w`)
      .join(', ');
  };

  const optimizedSrc = getOptimizedSrc(currentSrc);
  const srcSet = generateSrcSet(src);

  // Container styles for aspect ratio and layout stability
  const containerStyle = {
    ...props.style,
    ...(aspectRatio && { aspectRatio }),
    ...(width && height && { width, height })
  };

  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={containerStyle}
        role="img"
        aria-label={alt}
        {...props}
      >
        <div className="text-center">
          <svg 
            className="w-8 h-8 mx-auto mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <span className="text-xs">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`} 
      style={containerStyle}
      {...props}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center"
          style={{ 
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear'
          }}
        >
          {placeholder && typeof placeholder !== 'string' ? (
            placeholder
          ) : (
            <div className="w-6 h-6 border-2 border-orange-300 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      )}
      
      {/* Optimized image with responsive support */}
      {currentSrc && (
        <picture>
          {/* AVIF format for modern browsers */}
          {currentSrc.includes('http') && (
            <source 
              srcSet={srcSet || optimizedSrc} 
              sizes={sizes || '100vw'}
              type="image/avif" 
            />
          )}
          
          {/* WebP format fallback */}
          {currentSrc.includes('http') && (
            <source 
              srcSet={srcSet || optimizedSrc} 
              sizes={sizes || '100vw'}
              type="image/webp" 
            />
          )}
          
          {/* Original format fallback */}
          <img
            src={optimizedSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : loading}
            decoding="async"
            fetchPriority={priority ? 'high' : fetchPriority}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              maxWidth: '100%',
              height: 'auto',
              contentVisibility: 'auto',
              containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
            }}
            {...(srcSet && { srcSet, sizes: sizes || '100vw' })}
          />
        </picture>
      )}
    </div>
  );
};

// High-priority image component for above-the-fold content
export const CriticalImage = (props) => (
  <OptimizedImage 
    {...props} 
    priority={true} 
    loading="eager"
    fetchPriority="high"
  />
);

// Component for hero/banner images
export const HeroImage = (props) => (
  <OptimizedImage 
    {...props} 
    priority={true}
    loading="eager"
    fetchPriority="high"
    className={`${props.className || ''} hero-image`}
  />
);

// Component for lazy-loaded content images
export const ContentImage = (props) => (
  <OptimizedImage 
    {...props} 
    loading="lazy"
    className={`${props.className || ''} content-image`}
  />
);

export default OptimizedImage;