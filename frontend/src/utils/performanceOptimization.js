// Performance optimization utilities

// Debounce function for performance
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle function for scroll/resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// RequestAnimationFrame wrapper for smooth animations
export const raf = (callback) => {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(callback, 16); // Fallback for 60fps
};

// Cancel animation frame
export const cancelRaf = (id) => {
  if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
    return window.cancelAnimationFrame(id);
  }
  return clearTimeout(id);
};

// Intersection Observer for element visibility
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observerOptions = { ...defaultOptions, ...options };
  
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, observerOptions);
};

// Preload critical resources
export const preloadResource = (href, as, type = null, crossorigin = null) => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (type) link.type = type;
  if (crossorigin) link.crossOrigin = crossorigin;
  
  document.head.appendChild(link);
};

// Preload critical CSS
export const preloadCriticalCSS = (cssUrls) => {
  if (typeof document === 'undefined') return;
  
  cssUrls.forEach(url => {
    preloadResource(url, 'style');
  });
};

// Load CSS asynchronously
export const loadCSSAsync = (href) => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = 'style';
  link.onload = function() {
    this.onload = null;
    this.rel = 'stylesheet';
  };
  
  document.head.appendChild(link);
  
  // Fallback for browsers that don't support preload
  const noscript = document.createElement('noscript');
  const fallbackLink = document.createElement('link');
  fallbackLink.rel = 'stylesheet';
  fallbackLink.href = href;
  noscript.appendChild(fallbackLink);
  document.head.appendChild(noscript);
};

// Load JavaScript asynchronously
export const loadScriptAsync = (src, callback = null) => {
  if (typeof document === 'undefined') return Promise.reject();
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (callback) callback();
      resolve();
    };
    
    script.onerror = reject;
    
    document.head.appendChild(script);
  });
};

// Measure performance metrics
export const measurePerformance = (name, fn) => {
  if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    performance.mark(startMark);
    
    const result = fn();
    
    if (result && typeof result.then === 'function') {
      return result.then(res => {
        performance.mark(endMark);
        performance.measure(name, startMark, endMark);
        return res;
      });
    }
    
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);
    return result;
  }
  
  return fn();
};

// Get Core Web Vitals
export const getCoreWebVitals = () => {
  if (typeof window === 'undefined') return null;
  
  const vitals = {};
  
  // LCP (Largest Contentful Paint)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation failed:', e);
    }
    
    // FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          vitals.fid = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observation failed:', e);
    }
    
    // CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            vitals.cls = clsValue;
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation failed:', e);
    }
  }
  
  return vitals;
};

// Optimize font loading
export const optimizeFontLoading = () => {
  if (typeof document === 'undefined') return;
  
  // Add font-display: swap to existing font links
  const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
  fontLinks.forEach(link => {
    if (!link.href.includes('display=swap')) {
      link.href += link.href.includes('?') ? '&display=swap' : '?display=swap';
    }
  });
};

// Reduce bundle size by code splitting
export const lazyLoadComponent = (importFunc) => {
  return React.lazy(() => 
    importFunc().catch(() => ({ default: () => <div>Failed to load component</div> }))
  );
};

// Optimize images for different screen densities
export const getOptimalImageSize = (containerWidth, devicePixelRatio = 1) => {
  const sizes = [320, 640, 768, 1024, 1280, 1920];
  const targetWidth = containerWidth * devicePixelRatio;
  
  return sizes.find(size => size >= targetWidth) || sizes[sizes.length - 1];
};

// Cache API responses
export const createCache = (maxSize = 50) => {
  const cache = new Map();
  
  return {
    get: (key) => cache.get(key),
    set: (key, value) => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    has: (key) => cache.has(key),
    delete: (key) => cache.delete(key),
    clear: () => cache.clear(),
    size: () => cache.size
  };
};

// Service Worker registration for caching
export const registerServiceWorker = async (swPath = '/sw.js') => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.register(swPath);
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
};

// Resource hints for better loading
export const addResourceHints = (hints) => {
  if (typeof document === 'undefined') return;
  
  hints.forEach(({ rel, href, as, type, crossorigin }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    
    if (as) link.as = as;
    if (type) link.type = type;
    if (crossorigin) link.crossOrigin = crossorigin;
    
    document.head.appendChild(link);
  });
};

// Critical resource prioritization
export const prioritizeResources = () => {
  if (typeof document === 'undefined') return;
  
  // Prioritize above-the-fold images
  const aboveFoldImages = document.querySelectorAll('img[data-priority="high"]');
  aboveFoldImages.forEach(img => {
    if ('fetchPriority' in img) {
      img.fetchPriority = 'high';
    }
    img.loading = 'eager';
  });
  
  // Defer below-the-fold content
  const belowFoldContent = document.querySelectorAll('[data-priority="low"]');
  belowFoldContent.forEach(element => {
    element.loading = 'lazy';
  });
};

export default {
  debounce,
  throttle,
  raf,
  cancelRaf,
  createIntersectionObserver,
  preloadResource,
  preloadCriticalCSS,
  loadCSSAsync,
  loadScriptAsync,
  measurePerformance,
  getCoreWebVitals,
  optimizeFontLoading,
  lazyLoadComponent,
  getOptimalImageSize,
  createCache,
  registerServiceWorker,
  addResourceHints,
  prioritizeResources
};