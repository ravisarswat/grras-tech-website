import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import useScrollToTop from './hooks/useScrollToTop';
import { ContentProvider } from './contexts/ContentContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import EnhancedCourses from './pages/EnhancedCourses';
import CategoryCoursePage from './pages/CategoryCoursePage';
import CourseDetail from './pages/CourseDetail';
import LearningPaths from './pages/LearningPaths';
import LearningPathDetail from './pages/LearningPathDetail';
import Admissions from './pages/Admissions';
import Testimonials from './pages/Testimonials';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

// Static Data
import { categories } from './data/categories';
import { courses } from './data/courses';
import blogPosts from './data/blog';

function AppContent() {
  useScrollToTop();
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
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
          
          {/* Learning Path Routes */}
          <Route path="/learning-paths" element={<LearningPaths />} />
          <Route path="/learning-paths/:pathSlug" element={<LearningPathDetail />} />
          
          {/* Other Routes */}
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <Router>
        <ContentProvider>
          <AppContent />
        </ContentProvider>
      </Router>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;