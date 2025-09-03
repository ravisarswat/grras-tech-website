import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, BookOpen, Star, ArrowRight } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const location = useLocation();
  const { content } = useContent();

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
              <nav className="hidden lg:flex items-center space-x-8 relative">
                {filteredNavigationItems.map((item) => (
                  <div key={item.name} className="relative">
                    {item.hasDropdown ? (
                      <div className="relative">
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

                        {/* GUARANTEED VISIBLE DROPDOWN */}
                        {isCoursesOpen && (
                          <div 
                            className="absolute bg-white border-2 border-orange-500 shadow-2xl rounded-lg p-6 mt-2"
                            onMouseEnter={handleDropdownOpen}
                            onMouseLeave={() => handleDropdownClose(200)}
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: '-200px',
                              width: '500px',
                              zIndex: 999999,
                              backgroundColor: '#ffffff',
                              border: '2px solid #ea580c',
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                          >
                            <h3 className="text-xl font-bold text-orange-800 mb-4 text-center">Technology Tracks</h3>
                            
                            <div className="space-y-3">
                              {technologyTracks.length > 0 ? (
                                technologyTracks.map((track) => (
                                  <Link
                                    key={track.id}
                                    to={track.path}
                                    className="flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 border border-orange-200"
                                    onClick={() => setIsCoursesOpen(false)}
                                  >
                                    <div>
                                      <div className="font-bold text-gray-900">{track.name}</div>
                                      <div className="text-sm text-gray-600">{track.courseCount} courses available</div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-orange-600" />
                                  </Link>
                                ))
                              </div>
                            ) : (
                                <div className="text-center text-gray-500 py-6">
                                  <div className="text-lg">Loading categories...</div>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t-2 border-orange-200 text-center">
                              <Link
                                to="/courses"
                                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg"
                                onClick={() => setIsCoursesOpen(false)}
                              >
                                🚀 View All Courses
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
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