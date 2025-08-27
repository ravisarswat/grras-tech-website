import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => {
  const quickLinks = [
    { name: 'Home', path: '/', icon: <Home className="h-4 w-4" /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen className="h-4 w-4" /> },
    { name: 'About Us', path: '/about', icon: <Search className="h-4 w-4" /> },
    { name: 'Contact', path: '/contact', icon: <Search className="h-4 w-4" /> }
  ];

  return (
    <>
      <SEO
        title="Page Not Found - GRRAS Solutions"
        description="The page you're looking for doesn't exist. Return to GRRAS Solutions homepage or explore our courses."
      />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full text-center">
          <div className="animate-fade-in-up">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="text-8xl md:text-9xl font-bold text-red-500 mb-4">
                404
              </div>
              <div className="text-6xl mb-4">🔍</div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4 mb-8">
              <Link
                to="/"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Home className="h-5 w-5" />
                Go to Homepage
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Go Back
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Links
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="flex items-center gap-2 p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    {link.icon}
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Need help?</strong> Contact our support team at{' '}
                <a 
                  href="tel:+919001991227" 
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  090019 91227
                </a>
                {' '}or{' '}
                <Link 
                  to="/contact" 
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  send us a message
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;