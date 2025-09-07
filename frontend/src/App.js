import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import './App.css';
import useScrollToTop from './hooks/useScrollToTop';
import usePerformanceMonitoring from './hooks/usePerformanceMonitoring';
import { ContentProvider } from './contexts/ContentContext';
import LoadingSpinner from './components/LoadingSpinner';

// Critical components (loaded immediately)
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';

// Lazy load non-critical components for better performance
const About = React.lazy(() => import('./pages/About'));
const Courses = React.lazy(() => import('./pages/Courses'));
const EnhancedCourses = React.lazy(() => import('./pages/EnhancedCourses'));
const CategoryCoursePage = React.lazy(() => import('./pages/CategoryCoursePage'));
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'));
const Admissions = React.lazy(() => import('./pages/Admissions'));
const Testimonials = React.lazy(() => import('./pages/Testimonials'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const AdminLeads = React.lazy(() => import('./pages/AdminLeads'));
const Placements = React.lazy(() => import('./pages/Placements'));

// Static Data
import { categories } from './data/categories';
import { courses } from './data/courses';
import blogPosts from './data/blog';

function AppContent() {
  useScrollToTop();
  const location = useLocation();
  
  // Register service worker for caching
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      // Log Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log('Navigation timing:', {
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              loadComplete: entry.loadEventEnd - entry.loadEventStart,
              firstPaint: entry.responseEnd - entry.requestStart
            });
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        console.log('Performance observer not supported');
      }
    }
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow" id="main-content">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              
              {/* Course Routes - New Classic Certification Academy */}  
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/category/:categorySlug" element={<CategoryCoursePage />} />
              <Route path="/courses/:slug" element={<CourseDetail />} />
              
              {/* Legacy course route for backward compatibility */}
              <Route path="/course/:slug" element={<CourseDetail />} />
              
              {/* Legacy course routes for backward compatibility */}
              <Route path="/enhanced-courses" element={<EnhancedCourses />} />
              <Route path="/old-courses" element={<Courses />} />
              
              {/* Other Routes */}
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/placements" element={<Placements />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              
              {/* Admin Routes */}
              <Route path="/admin/leads" element={<AdminLeads />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <div className="App min-h-screen bg-gray-50">
        <Router>
          <ContentProvider>
            <AppContent />
          </ContentProvider>
        </Router>
        <Toaster position="top-right" richColors />
      </div>
    </HelmetProvider>
  );
}

export default App;