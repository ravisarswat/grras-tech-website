// Mobile-specific performance optimizations
(function() {
  'use strict';
  
  // Detect mobile device early
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSlowConnection = navigator.connection && 
    (navigator.connection.effectiveType === 'slow-2g' || 
     navigator.connection.effectiveType === '2g' ||
     navigator.connection.saveData);
  
  // Apply mobile optimizations immediately
  if (isMobile) {
    document.documentElement.classList.add('mobile-device');
    
    // Optimize scrolling performance
    document.addEventListener('touchstart', function() {}, { passive: true });
    document.addEventListener('touchmove', function() {}, { passive: true });
    document.addEventListener('touchend', function() {}, { passive: true });
    
    // Reduce motion for slow devices
    if (isSlowConnection) {
      document.documentElement.classList.add('reduce-motion', 'slow-connection');
    }
  }
  
  // Optimize font loading for mobile
  if ('fonts' in document) {
    // Use font-display: swap for better mobile performance
    const fontLoadTimeout = setTimeout(function() {
      document.documentElement.classList.add('fonts-timeout');
    }, 3000);
    
    document.fonts.ready.then(function() {
      clearTimeout(fontLoadTimeout);
      document.documentElement.classList.add('fonts-loaded');
    });
  }
  
  // Defer non-critical resources on mobile
  function deferNonCriticalResources() {
    // Defer analytics and tracking scripts
    const scripts = [
      // Add any non-critical scripts here
    ];
    
    scripts.forEach(function(src) {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });
  }
  
  // Load non-critical resources after initial page load
  if (document.readyState === 'complete') {
    deferNonCriticalResources();
  } else {
    window.addEventListener('load', deferNonCriticalResources);
  }
  
  // Optimize images for mobile
  function optimizeImagesForMobile() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: isMobile ? '50px 0px' : '100px 0px' // Smaller margin for mobile
      });
      
      images.forEach(function(img) {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for older browsers
      images.forEach(function(img) {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  }
  
  // Initialize image optimization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeImagesForMobile);
  } else {
    optimizeImagesForMobile();
  }
  
  // Monitor and report mobile performance metrics
  function reportMobileMetrics() {
    if (!window.performance || !window.performance.getEntriesByType) return;
    
    const navigation = window.performance.getEntriesByType('navigation')[0];
    if (!navigation) return;
    
    const metrics = {
      // Mobile-specific metrics
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstByte: navigation.responseStart - navigation.requestStart,
      
      // Calculate mobile performance score
      isMobile: isMobile,
      isSlowConnection: isSlowConnection,
      connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown'
    };
    
    // Report to analytics if available
    if (window.gtag && isMobile) {
      window.gtag('event', 'mobile_performance', {
        event_category: 'performance',
        custom_map: {
          'custom_parameter_1': 'dom_content_loaded',
          'custom_parameter_2': 'load_complete',
          'custom_parameter_3': 'first_byte'
        },
        'custom_parameter_1': Math.round(metrics.domContentLoaded),
        'custom_parameter_2': Math.round(metrics.loadComplete),
        'custom_parameter_3': Math.round(metrics.firstByte),
        non_interaction: true
      });
    }
    
    console.log('Mobile Performance Metrics:', metrics);
  }
  
  // Report metrics after page load
  window.addEventListener('load', function() {
    setTimeout(reportMobileMetrics, 1000);
  });
  
  // Optimize touch interactions
  if (isMobile) {
    // Prevent 300ms tap delay
    document.addEventListener('touchstart', function(e) {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.getAttribute('role') === 'button') {
        e.target.style.transform = 'scale(0.98)';
      }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.getAttribute('role') === 'button') {
        setTimeout(function() {
          e.target.style.transform = '';
        }, 150);
      }
    }, { passive: true });
  }
  
  // Memory management for mobile
  function cleanupMemory() {
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      if (usagePercent > 85) {
        console.warn('High memory usage detected:', Math.round(usagePercent) + '%');
        
        // Force garbage collection if available
        if (window.gc) {
          window.gc();
        }
        
        // Clear unnecessary caches
        if ('caches' in window) {
          caches.keys().then(function(names) {
            names.forEach(function(name) {
              if (name.includes('old-') || name.includes('temp-')) {
                caches.delete(name);
              }
            });
          });
        }
      }
    }
  }
  
  // Monitor memory usage periodically on mobile
  if (isMobile) {
    setInterval(cleanupMemory, 30000); // Check every 30 seconds
  }
  
})();