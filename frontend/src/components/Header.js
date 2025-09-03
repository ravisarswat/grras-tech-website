import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, BookOpen, Star, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useContent } from '../contexts/ContentContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [isMobileCoursesOpen, setIsMobileCoursesOpen] = useState(false);
  const { content } = useContent();
  const location = useLocation();

  // Optimized dropdown handlers for smooth UX
  const handleDropdownOpen = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setIsCoursesOpen(true);
  };

  const handleDropdownClose = (delay = 200) => {
    const timeout = setTimeout(() => {
      setIsCoursesOpen(false);
    }, delay);
    setDropdownTimeout(timeout);
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  // Close dropdown on navigation
  useEffect(() => {
    setIsCoursesOpen(false);
    setIsMenuOpen(false);
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }
  }, [location.pathname, dropdownTimeout]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCoursesOpen && !event.target.closest('nav')) {
        setIsCoursesOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isCoursesOpen]);

  // Close dropdown when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isCoursesOpen) {
        setIsCoursesOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCoursesOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
      setIsMobileCoursesOpen(false);
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMenuOpen]);

  // Get ONLY dynamic categories from admin panel
  const categories = content?.courseCategories || {};
  const courses = content?.courses || [];

  // Build technology tracks ONLY from admin categories - NO HARDCODE
  const technologyTracks = Object.entries(categories)
    .filter(([, category]) => category.visible !== false)
    .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999))
    .map(([slug, category]) => ({
      id: slug,
      name: category.name,
      path: `/courses?tab=${slug}`,
      logo: category.logo || 'https://www.vectorlogo.zone/logos/java/java-icon.svg', // fallback logo
      courseCount: courses.filter(course => course.categories?.includes(slug)).length
    }));

  const isActivePath = (path) => location.pathname === path;
  const isAdminPage = location.pathname.startsWith('/admin');

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses', hasDropdown: true },
    { name: 'Learning Paths', path: '/learning-paths' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' }
  ];

  const filteredNavigationItems = isAdminPage 
    ? navigationItems.filter(item => !item.hasDropdown)
    : navigationItems;

  const filteredMobileNavigationItems = isAdminPage 
    ? navigationItems.filter(item => !item.hasDropdown)
    : navigationItems;

  return (
    <>
      {!isAdminPage && (
        <header className="bg-white/98 backdrop-blur-xl shadow-2xl border-b border-orange-100/50 sticky top-0 z-[99998] relative overflow-hidden">
          {/* Beautiful Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50/30 via-white to-red-50/30"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex justify-between items-center py-4">
              {/* ENHANCED COMPANY LOGO */}
              <Link to="/" className="flex items-center group relative">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-all duration-500 blur-sm"></div>
                    {/* GRRAS Logo as SVG - Same design, better format */}
                    <div className="relative w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-all duration-500 border-2 border-orange-100">
                      <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-md">
                        {/* GRRAS Logo Recreation in SVG */}
                        <defs>
                          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ea580c" />
                            <stop offset="50%" stopColor="#dc2626" />
                            <stop offset="100%" stopColor="#ea580c" />
                          </linearGradient>
                        </defs>
                        
                        {/* Background Circle */}
                        <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" stroke="#fff" strokeWidth="2"/>
                        
                        {/* Letter G */}
                        <text x="50" y="65" 
                              fontSize="40" 
                              fontFamily="Arial, sans-serif" 
                              fontWeight="bold" 
                              fill="white" 
                              textAnchor="middle"
                              dominantBaseline="middle">
                          G
                        </text>
                        
                        {/* Decorative Elements */}
                        <circle cx="75" cy="25" r="3" fill="white" opacity="0.8">
                          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="25" cy="75" r="2" fill="white" opacity="0.6">
                          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="3s" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm font-black text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text -mt-1 tracking-wide group-hover:scale-105 transition-all duration-300">
                    Solutions
                  </span>
                </div>
                
                {/* Sparkle Effects */}
                <div className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-200"></div>
              </Link>

              {/* Enhanced Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                {filteredNavigationItems.map((item) => (
                  <div key={item.name} className="relative">
                    {item.hasDropdown ? (
                      <button
                        className="flex items-center space-x-2 text-gray-800 hover:text-orange-600 font-bold py-3 px-2 rounded-xl transition-all duration-200 hover:bg-orange-50 hover:shadow-md group relative"
                        onMouseEnter={handleDropdownOpen}
                        onMouseLeave={() => handleDropdownClose(300)}
                      >
                        <span className="text-base">{item.name}</span>
                        <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                        
                        {/* Hover underline effect */}
                        <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full"></div>
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        className={`relative text-gray-800 hover:text-orange-600 font-bold py-3 px-4 rounded-xl transition-all duration-300 group ${
                          isActivePath(item.path) 
                            ? 'text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg ring-2 ring-orange-200' 
                            : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:shadow-md'
                        }`}
                      >
                        <span className="relative z-10">{item.name}</span>
                        
                        {/* Active indicator */}
                        {isActivePath(item.path) && (
                          <>
                            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg"></span>
                            <div className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          </>
                        )}
                        
                        {/* Hover underline effect */}
                        {!isActivePath(item.path) && (
                          <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full"></div>
                        )}
                        
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Link>
                    )}

                    {/* Simple, Reliable Dropdown - No Portal */}
                    {item.hasDropdown && isCoursesOpen && (
                      <div 
                        className="absolute top-full left-0 w-screen bg-white shadow-2xl border-t-4 border-orange-500 animate-in slide-in-from-top-2 duration-200"
                        onMouseEnter={handleDropdownOpen}
                        onMouseLeave={() => handleDropdownClose(200)}
                        style={{
                          zIndex: 99999,
                          marginLeft: '-50vw',
                          left: '50%',
                          position: 'absolute'
                        }}
                      >
                        <div className="p-6">
                          {/* Simple Header */}
                          <div className="bg-gradient-to-r from-orange-100 to-red-100 px-6 py-4 mb-4 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-orange-800">Technology Tracks</h3>
                                <p className="text-sm text-gray-600">Choose your career path</p>
                              </div>
                            </div>
                          </div>

                          {/* Simple Categories Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {technologyTracks.length > 0 ? (
                              technologyTracks.map((track) => (
                                <Link
                                  key={track.id}
                                  to={track.path}
                                  className="group flex items-center space-x-3 p-3 rounded-xl border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                                  onClick={() => setIsCoursesOpen(false)}
                                >
                                  <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center">
                                    {track.logo ? (
                                      <img 
                                        src={track.logo} 
                                        alt={track.name}
                                        className="w-7 h-7 object-contain"
                                      />
                                    ) : (
                                      <BookOpen className="h-6 w-6 text-orange-600" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-700">
                                      {track.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {track.courseCount} course{track.courseCount !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600" />
                                </Link>
                              ))
                            ) : (
                              <div className="col-span-2 text-center py-8 text-gray-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No categories available</p>
                              </div>
                            )}
                          </div>

                          {/* Simple Footer */}
                          <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm text-gray-600">Explore all courses</span>
                            <Link
                              to="/courses"
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200"
                              onClick={() => setIsCoursesOpen(false)}
                            >
                              View All
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {/* Enhanced Premium Mobile Menu Button */}
              <button
                className="lg:hidden p-3 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-red-50 hover:from-orange-100 hover:to-red-100 border-2 border-orange-200 transition-all duration-500 hover:shadow-xl hover:scale-110 group relative overflow-hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-orange-600 transition-all duration-300 group-hover:rotate-90 relative z-10" />
                ) : (
                  <Menu className="h-6 w-6 text-orange-600 transition-all duration-300 group-hover:scale-110 relative z-10" />
                )}
                
                {/* Sparkle effect */}
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="lg:hidden bg-white border-t">
              <div className="container mx-auto px-4 py-6">
                <div className="space-y-4">
                  {filteredMobileNavigationItems.map((item, index) => (
                    <div key={index}>
                      {item.hasDropdown ? (
                        <div>
                          <button
                            onClick={() => setIsMobileCoursesOpen(!isMobileCoursesOpen)}
                            className="flex items-center justify-between w-full text-left py-3 text-lg font-medium text-gray-700 hover:text-blue-600"
                          >
                            <span>{item.name}</span>
                            <ChevronDown className={`h-5 w-5 transform transition-transform ${isMobileCoursesOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isMobileCoursesOpen && (
                            <div className="ml-4 mt-3 space-y-3">
                              {technologyTracks.map((track) => (
                                <Link
                                  key={track.id}
                                  to={track.path}
                                  className="flex items-center justify-between py-2 text-gray-600 hover:text-blue-600"
                                  onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsMobileCoursesOpen(false);
                                  }}
                                >
                                  <div className="flex items-center space-x-3">
                                    <img 
                                      src={track.logo} 
                                      alt={track.name}
                                      className="w-6 h-6 object-contain"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                    <div className="hidden w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                      <BookOpen className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <span className="font-medium">{track.name}</span>
                                  </div>
                                  <span className="text-sm text-gray-400">{track.courseCount}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.path}
                          className="block py-3 text-lg font-medium text-gray-700 hover:text-blue-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </nav>
          )}
        </header>
      )}
    </>
  );
};

export default Header;