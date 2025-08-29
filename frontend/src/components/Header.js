import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const location = useLocation();

  const courses = [
    { slug: 'bca-degree', name: 'BCA Degree Program' },
    { slug: 'devops-training', name: 'DevOps Training' },
    { slug: 'redhat-certifications', name: 'Red Hat Certifications' },
    { slug: 'data-science-machine-learning', name: 'Data Science & ML' },
    { slug: 'java-salesforce', name: 'Java & Salesforce' },
    { slug: 'python', name: 'Python' },
    { slug: 'c-cpp-dsa', name: 'C/C++ & DSA' },
    { slug: 'cyber-security', name: 'Cyber Security' }
  ];

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses', hasDropdown: true },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="https://customer-assets.emergentagent.com/job_training-hub-29/artifacts/gl3ldkmg_white%20logo.png"
              alt="GRRAS Solutions"
              className="h-12 sm:h-16 w-auto bg-gray-900 rounded-lg p-2 hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">GRRAS Solutions</h1>
              <p className="text-xs sm:text-sm text-gray-600">Training Institute</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <div key={item.name} className="relative">
                {item.hasDropdown ? (
                  <div 
                    className="relative"
                    onMouseEnter={() => setIsCoursesOpen(true)}
                  >
                    <button
                      type="button"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActivePath(item.path) || location.pathname.startsWith('/courses')
                          ? 'text-red-600 bg-red-50'
                          : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                      }`}
                      onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isCoursesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown */}
                    {isCoursesOpen && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-[9999]"
                        onMouseEnter={() => setIsCoursesOpen(true)}
                        onMouseLeave={() => {
                          setTimeout(() => setIsCoursesOpen(false), 300);
                        }}
                      >
                        <Link
                          to="/courses"
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setIsCoursesOpen(false);
                          }}
                        >
                          All Courses
                        </Link>
                        <div className="border-t border-gray-100 my-2"></div>
                        {courses.map((course) => (
                          <Link
                            key={course.slug}
                            to={`/courses/${course.slug}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            onClick={() => {
                              setIsCoursesOpen(false);
                            }}
                          >
                            {course.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActivePath(item.path)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/admissions"
              className="btn-primary"
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100">
            <div className="pt-4 space-y-2">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActivePath(item.path)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                    }`}
                    onClick={() => !item.hasDropdown && setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  
                  {/* Mobile Courses Submenu */}
                  {item.hasDropdown && (
                    <div className="pl-6 space-y-1 mt-2">
                      {courses.map((course) => (
                        <Link
                          key={course.slug}
                          to={`/courses/${course.slug}`}
                          className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {course.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-100">
                <Link
                  to="/admissions"
                  className="block w-full text-center btn-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;