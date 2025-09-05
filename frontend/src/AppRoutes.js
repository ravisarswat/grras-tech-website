import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import useScrollToTop from './hooks/useScrollToTop';
import { ContentProvider } from './contexts/ContentContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import EnhancedCourses from './pages/EnhancedCourses';
import CategoryCoursePage from './pages/CategoryCoursePage';
import CourseDetail from './pages/CourseDetail';
import Admissions from './pages/Admissions';
import Testimonials from './pages/Testimonials';
import Placements from './pages/Placements';
import LearningPaths from './pages/LearningPaths';
import LearningPathDetail from './pages/LearningPathDetail';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import AdminLeads from './pages/AdminLeads';
import AdminContent from './pages/AdminContent';

// 404 Not Found component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">Go back home</a>
    </div>
  </div>
);

function AppContent() {
  useScrollToTop();
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow" id="main-content">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            
            {/* Course Routes */}  
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
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route path="/learning-paths/:slug" element={<LearningPathDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Admin Routes */}
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/content" element={<AdminContent />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

const AppRoutes = () => {
  return (
    <div className="App min-h-screen bg-gray-50">
      <HelmetProvider>
        <ContentProvider>
          <AppContent />
        </ContentProvider>
      </HelmetProvider>
    </div>
  );
};

export default AppRoutes;