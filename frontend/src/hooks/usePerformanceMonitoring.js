import { useEffect } from 'react';

// Performance monitoring hook
const usePerformanceMonitoring = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    // Monitor Core Web Vitals
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            console.log('LCP:', lastEntry.startTime);
            
            // Track LCP in analytics
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                event_category: 'performance',
                event_label: 'LCP',
                value: Math.round(lastEntry.startTime),
                non_interaction: true
              });
            }
          });
          
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP observation failed:', e);
        }

        // First Input Delay (FID)
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              const fid = entry.processingStart - entry.startTime;
              console.log('FID:', fid);
              
              if (window.gtag) {
                window.gtag('event', 'web_vitals', {
                  event_category: 'performance',
                  event_label: 'FID',
                  value: Math.round(fid),
                  non_interaction: true
                });
              }
            });
          });
          
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.warn('FID observation failed:', e);
        }

        // Cumulative Layout Shift (CLS)
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                console.log('CLS:', clsValue);
                
                if (window.gtag) {
                  window.gtag('event', 'web_vitals', {
                    event_category: 'performance',
                    event_label: 'CLS',
                    value: Math.round(clsValue * 1000),
                    non_interaction: true
                  });
                }
              }
            });
          });
          
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('CLS observation failed:', e);
        }

        // First Contentful Paint (FCP)
        try {
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            console.log('FCP:', lastEntry.startTime);
            
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                event_category: 'performance',
                event_label: 'FCP',
                value: Math.round(lastEntry.startTime),
                non_interaction: true
              });
            }
          });
          
          fcpObserver.observe({ entryTypes: ['paint'] });
        } catch (e) {
          console.warn('FCP observation failed:', e);
        }

        // Time to Interactive (TTI) approximation
        const measureTTI = () => {
          const navigationEntry = performance.getEntriesByType('navigation')[0];
          if (navigationEntry) {
            const tti = navigationEntry.domInteractive - navigationEntry.navigationStart;
            console.log('TTI (approx):', tti);
            
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                event_category: 'performance',
                event_label: 'TTI',
                value: Math.round(tti),
                non_interaction: true
              });
            }
          }
        };

        // Measure TTI after page load
        setTimeout(measureTTI, 0);
      }
    };

    // Monitor resource loading
    const observeResourceTiming = () => {
      const resources = performance.getEntriesByType('resource');
      
      // Group resources by type
      const resourceTypes = {
        images: [],
        scripts: [],
        stylesheets: [],
        fonts: [],
        other: []
      };

      resources.forEach(resource => {
        const url = new URL(resource.name);
        const extension = url.pathname.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(extension)) {
          resourceTypes.images.push(resource);
        } else if (['js'].includes(extension)) {
          resourceTypes.scripts.push(resource);
        } else if (['css'].includes(extension)) {
          resourceTypes.stylesheets.push(resource);
        } else if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) {
          resourceTypes.fonts.push(resource);
        } else {
          resourceTypes.other.push(resource);
        }
      });

      // Log performance metrics by type
      Object.entries(resourceTypes).forEach(([type, resources]) => {
        if (resources.length > 0) {
          const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
          const avgDuration = resources.reduce((sum, r) => sum + r.duration, 0) / resources.length;
          
          console.log(`${type}:`, {
            count: resources.length,
            totalSize: Math.round(totalSize / 1024) + 'KB',
            avgDuration: Math.round(avgDuration) + 'ms'
          });
        }
      });

      // Identify slow resources
      const slowResources = resources.filter(r => r.duration > 1000);
      if (slowResources.length > 0) {
        console.warn('Slow resources (>1s):', slowResources.map(r => ({
          name: r.name,
          duration: Math.round(r.duration) + 'ms',
          size: Math.round((r.transferSize || 0) / 1024) + 'KB'
        })));
      }
    };

    // Monitor navigation timing
    const observeNavigationTiming = () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0];
      
      if (navigationEntry) {
        const metrics = {
          dns: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
          tcp: navigationEntry.connectEnd - navigationEntry.connectStart,
          request: navigationEntry.responseStart - navigationEntry.requestStart,
          response: navigationEntry.responseEnd - navigationEntry.responseStart,
          domProcessing: navigationEntry.domContentLoadedEventStart - navigationEntry.domLoading,
          domComplete: navigationEntry.domComplete - navigationEntry.domLoading,
          loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart
        };

        console.log('Navigation Timing:', {
          'DNS Lookup': Math.round(metrics.dns) + 'ms',
          'TCP Connection': Math.round(metrics.tcp) + 'ms',
          'Request': Math.round(metrics.request) + 'ms',
          'Response': Math.round(metrics.response) + 'ms',
          'DOM Processing': Math.round(metrics.domProcessing) + 'ms',
          'DOM Complete': Math.round(metrics.domComplete) + 'ms',
          'Load Complete': Math.round(metrics.loadComplete) + 'ms'
        });

        // Track slow navigation phases
        if (metrics.dns > 200) console.warn('Slow DNS lookup:', metrics.dns + 'ms');
        if (metrics.tcp > 200) console.warn('Slow TCP connection:', metrics.tcp + 'ms');
        if (metrics.response > 500) console.warn('Slow response:', metrics.response + 'ms');
      }
    };

    // Monitor memory usage (if available)
    const observeMemoryUsage = () => {
      if (performance.memory) {
        const memory = performance.memory;
        console.log('Memory Usage:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        });

        // Warn if memory usage is high
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
          console.warn('High memory usage:', Math.round(usagePercent) + '%');
        }
      }
    };

    // Initialize monitoring
    const initializeMonitoring = () => {
      observeWebVitals();
      
      // Wait for page load to measure other metrics
      if (document.readyState === 'complete') {
        observeResourceTiming();
        observeNavigationTiming();
        observeMemoryUsage();
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => {
            observeResourceTiming();
            observeNavigationTiming();
            observeMemoryUsage();
          }, 1000);
        });
      }
    };

    // Start monitoring
    initializeMonitoring();

    // Monitor connection quality
    if (navigator.connection) {
      const connection = navigator.connection;
      console.log('Connection:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink + ' Mbps',
        rtt: connection.rtt + 'ms',
        saveData: connection.saveData
      });

      // Adjust behavior based on connection
      if (connection.saveData || connection.effectiveType === 'slow-2g') {
        console.log('Data saver mode or slow connection detected');
        // Could disable certain features or reduce image quality here
      }
    }

    // Performance budget monitoring
    const checkPerformanceBudget = () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.navigationStart;
          const budget = {
            maxLoadTime: 3000,
            maxTTFB: 800,
            maxFCP: 1500,
            maxLCP: 2500
          };

          if (loadTime > budget.maxLoadTime) {
            console.warn('Performance budget exceeded - Load Time:', loadTime + 'ms > ' + budget.maxLoadTime + 'ms');
          }
        }
      }, 5000);
    };

    checkPerformanceBudget();

  }, []);
};

export default usePerformanceMonitoring;