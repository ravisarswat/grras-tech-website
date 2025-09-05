import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ContentProvider } from '../contexts/ContentContext';

// Import components
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/ErrorBoundary';
import Home from '../pages/Home';
import About from '../pages/About';
import Courses from '../pages/Courses';
import CourseDetail from '../pages/CourseDetail';
import CategoryCoursePage from '../pages/CategoryCoursePage';
import Admissions from '../pages/Admissions';
import Placements from '../pages/Placements';
import Blog from '../pages/Blog';
import BlogPost from '../pages/BlogPost';
import Contact from '../pages/Contact';
import AdminLeads from '../pages/AdminLeads';

// Import CSS (this won't actually load in Node.js but prevents errors)
import '../App.css';

const ServerApp = () => {
  return (
    <div className="App min-h-screen bg-gray-50">
      <ContentProvider>
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
                
                {/* Other Routes */}
                <Route path="/admissions" element={<Admissions />} />
                <Route path="/placements" element={<Placements />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Admin Routes */}
                <Route path="/admin/leads" element={<AdminLeads />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </ContentProvider>
    </div>
  );
};

export default ServerApp;