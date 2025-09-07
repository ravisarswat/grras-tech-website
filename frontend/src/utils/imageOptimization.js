// Image optimization utilities for better performance

// Lazy loading intersection observer
export const createLazyLoadObserver = (callback) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '50px 0px'
    }
  );
};

// WebP/AVIF support detection
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const supportsAVIF = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

// Get optimized image URL
export const getOptimizedImageUrl = (originalUrl, width = null, height = null) => {
  if (!originalUrl) return '';
  
  // For external CDN images, we can't modify the format, but we can optimize loading
  if (originalUrl.includes('worldvectorlogo.com') || 
      originalUrl.includes('wikimedia.org') || 
      originalUrl.includes('emergentagent.com')) {
    return originalUrl;
  }
  
  // Add width/height parameters if supported by the CDN
  let optimizedUrl = originalUrl;
  
  // Add parameters for better caching and performance
  const params = new URLSearchParams();
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  params.append('f', 'auto'); // Auto format
  params.append('q', '85'); // Quality
  
  if (params.toString()) {
    optimizedUrl += (originalUrl.includes('?') ? '&' : '?') + params.toString();
  }
  
  return optimizedUrl;
};

// Preload critical images
export const preloadImage = (src, priority = 'low') => {
  if (typeof window === 'undefined') return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    
    // Set priority for better loading
    if ('fetchPriority' in img) {
      img.fetchPriority = priority;
    }
    
    img.src = src;
  });
};

// Batch preload images
export const preloadImages = async (urls, priority = 'low') => {
  const promises = urls.map(url => preloadImage(url, priority).catch(() => null));
  return Promise.allSettled(promises);
};

// Image loading with retry mechanism
export const loadImageWithRetry = (src, retries = 2) => {
  return new Promise((resolve, reject) => {
    const attemptLoad = (attempt) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (attempt < retries) {
          setTimeout(() => attemptLoad(attempt + 1), 1000 * attempt);
        } else {
          reject(new Error(`Failed to load image after ${retries} attempts`));
        }
      };
      
      img.src = src;
    };
    
    attemptLoad(1);
  });
};

// Generate responsive image srcSet
export const generateSrcSet = (baseUrl, sizes = [320, 640, 1024, 1200, 1600]) => {
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, size)} ${size}w`)
    .join(', ');
};

// Generate sizes attribute for responsive images
export const generateSizes = (breakpoints = [
  { media: '(max-width: 320px)', size: '300px' },
  { media: '(max-width: 640px)', size: '600px' },
  { media: '(max-width: 1024px)', size: '900px' },
  { media: '(max-width: 1200px)', size: '1100px' }
]) => {
  const sizesArray = breakpoints.map(bp => `${bp.media} ${bp.size}`);
  sizesArray.push('100vw'); // Default fallback
  return sizesArray.join(', ');
};

// Calculate aspect ratio to prevent layout shift
export const calculateAspectRatio = (width, height) => {
  if (!width || !height) return 'auto';
  return `${width} / ${height}`;
};

// Optimize image loading based on device capabilities
export const getImageLoadingStrategy = () => {
  if (typeof window === 'undefined') return 'lazy';
  
  // Check connection quality
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    const { effectiveType, saveData } = connection;
    
    // Use lazy loading for slow connections or data saver mode
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'lazy';
    }
  }
  
  return 'lazy'; // Default to lazy loading for better performance
};

// Image error handling with fallback
export const handleImageError = (event, fallbackSrc = null) => {
  const img = event.target;
  
  if (fallbackSrc && img.src !== fallbackSrc) {
    img.src = fallbackSrc;
    return;
  }
  
  // Hide image if no fallback available
  img.style.display = 'none';
  
  // Add error class for styling
  img.classList.add('image-error');
  
  // Emit custom event for error tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'image_load_error', {
      event_category: 'performance',
      event_label: img.src,
      non_interaction: true
    });
  }
};

// Create optimized image element
export const createOptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  sizes = null,
  priority = false
}) => {
  const img = document.createElement('img');
  
  // Basic attributes
  img.src = getOptimizedImageUrl(src, width, height);
  img.alt = alt;
  img.className = className;
  img.loading = priority ? 'eager' : loading;
  img.decoding = decoding;
  
  // Dimensions for layout stability
  if (width) img.width = width;
  if (height) img.height = height;
  
  // Responsive attributes
  if (sizes) {
    img.srcset = generateSrcSet(src);
    img.sizes = sizes;
  }
  
  // Performance attributes
  if (priority && 'fetchPriority' in img) {
    img.fetchPriority = 'high';
  }
  
  // Error handling
  img.onerror = (e) => handleImageError(e);
  
  return img;
};

export default {
  createLazyLoadObserver,
  supportsWebP,
  supportsAVIF,
  getOptimizedImageUrl,
  preloadImage,
  preloadImages,
  loadImageWithRetry,
  generateSrcSet,
  generateSizes,
  calculateAspectRatio,
  getImageLoadingStrategy,
  handleImageError,
  createOptimizedImage
};