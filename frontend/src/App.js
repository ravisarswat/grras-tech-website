import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './contexts/ContentContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import SEO from './components/SEO';
import useScrollToTop from './hooks/useScrollToTop';

// Import all pages
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Admissions from './pages/Admissions';
import Contact from './pages/Contact';
import AdminLeads from './pages/AdminLeads';
import AdminContent from './pages/AdminContent';
import EnhancedCourses from './pages/EnhancedCourses';
import CategoryCoursePage from './pages/CategoryCoursePage';
import LearningPathDetail from './pages/LearningPathDetail';
import LearningPaths from './pages/LearningPaths';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import CertificationCoursesPage from './components/CertificationCoursesPage';

// 404 Page Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Oops! Page Not Found</h2>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.</p>
      <div className="space-y-2">
        <a href="/" className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
          🏠 Go to Homepage
        </a>
        <br />
        <button onClick={() => window.history.back()} className="inline-block border border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors">
          ← Go Back
        </button>
      </div>
      <div className="mt-8">
        <p className="text-sm text-gray-500 mb-4">Quick Links</p>
        <div className="flex justify-center space-x-4">
          <a href="/" className="text-red-600 hover:underline">🏡 Home</a>
          <a href="/courses" className="text-red-600 hover:underline">📚 Courses</a>
          <a href="/about" className="text-red-600 hover:underline">ℹ️ About Us</a>
          <a href="/contact" className="text-red-600 hover:underline">📞 Contact</a>
        </div>
      </div>
    </div>
  </div>
);

// Privacy Page Component
const Privacy = () => (
  <div className="min-h-screen py-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p>At GRRAS Solutions, we are committed to protecting your privacy and personal information.</p>
        <h2>Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact us.</p>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
        <h2>Information Sharing</h2>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>
        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at info@grrassolutions.com</p>
      </div>
    </div>
  </div>
);

// Component to handle scroll-to-top inside Router context
const AppContent = () => {
  useScrollToTop();
  
  return (
    <div className="App min-h-screen flex flex-col">
      <SEO />
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admissions" element={<Admissions />} />
          
          {/* Course Routes - Dynamic Categories System */}  
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:categorySlug" element={<CategoryCoursePage />} />
          <Route path="/course/:slug" element={<CourseDetail />} />
          <Route path="/enhanced-courses" element={<EnhancedCourses />} />
          <Route path="/certification-courses" element={<CertificationCoursesPage />} />
          
          {/* Learning Paths */}
          <Route path="/learning-paths" element={<LearningPaths />} />
          <Route path="/learning-path/:pathSlug" element={<LearningPathDetail />} />
          
          {/* Blog */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* Admin Routes */}
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin" element={<AdminContent />} />
          
          {/* Legal Pages */}
          <Route path="/privacy" element={<Privacy />} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <Router>
          <AppContent />
        </Router>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;