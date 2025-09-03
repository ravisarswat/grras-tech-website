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

  // Get categories for dropdown
  const courseCategories = content?.courseCategories || {};
  const technologyTracks = Object.entries(courseCategories)
    .filter(([, category]) => category.visible !== false)
    .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999))
    .map(([slug, category]) => ({
      id: slug,
      name: category.name,
      path: `/courses?tab=${slug}`,
      courseCount: category.courseCount || 0,
      logo: category.logo
    }));

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses', hasDropdown: true },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="bg-white/98 backdrop-blur-xl shadow-2xl border-b border-orange-100/50 sticky top-0 z-[99998] relative overflow-hidden">
        {/* Beautiful Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/30 via-white to-red-50/30"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center py-4">
            {/* COMPANY LOGO */}
            <Link to="/" className="flex items-center group relative">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-all duration-500 blur-sm"></div>
                  {/* GRRAS Original Logo as SVG */}
                  <div className="relative w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-all duration-500 border-2 border-orange-100">
                    <svg width="48" height="48" viewBox="0 0 200 120" className="drop-shadow-md">
                      {/* GRRAS Logo Recreation based on your actual logo */}
                      <defs>
                        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff4444" />
                          <stop offset="100%" stopColor="#cc0000" />
                        </linearGradient>
                        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#44ff44" />
                          <stop offset="100%" stopColor="#00cc00" />
                        </linearGradient>
                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6699ff" />
                          <stop offset="100%" stopColor="#0066cc" />
                        </linearGradient>
                      </defs>
                      
                      {/* Three diamond shapes like in your logo */}
                      <rect x="80" y="15" width="20" height="20" rx="4" fill="url(#redGradient)" transform="rotate(45 90 25)"/>
                      <rect x="60" y="35" width="18" height="18" rx="3" fill="url(#greenGradient)" transform="rotate(45 69 44)"/>
                      <rect x="100" y="35" width="18" height="18" rx="3" fill="url(#blueGradient)" transform="rotate(45 109 44)"/>
                      
                      {/* "grras" text in lowercase bold */}
                      <text x="100" y="85" 
                            fontSize="28" 
                            fontFamily="Arial, sans-serif" 
                            fontWeight="900" 
                            fill="#000000" 
                            textAnchor="middle"
                            dominantBaseline="middle">
                        grras
                      </text>
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text -mt-1 tracking-wide group-hover:scale-105 transition-all duration-300">
                  Solutions
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 relative">
              {navigationItems.map((item) => (
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
                      </button>

                      {/* SIMPLE GUARANTEED VISIBLE DROPDOWN */}
                      {isCoursesOpen && (
                        <div 
                          className="absolute top-full left-1/2 transform -translate-x-1/2 w-96 bg-white border-2 border-orange-500 shadow-2xl rounded-xl p-6 mt-2"
                          onMouseEnter={handleDropdownOpen}
                          onMouseLeave={() => handleDropdownClose(200)}
                          style={{
                            zIndex: 999999,
                            backgroundColor: 'white',
                            minWidth: '400px'
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
                                    <div className="text-sm text-gray-600">{track.courseCount} courses</div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-orange-600" />
                                </Link>
                              ))
                            ) : (
                              <div className="text-center text-gray-500 py-6">
                                Loading categories...
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

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-3 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-red-50 hover:from-orange-100 hover:to-red-100 border-2 border-orange-200 transition-all duration-500 hover:shadow-xl hover:scale-110 group relative overflow-hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-orange-600 transition-all duration-300 group-hover:rotate-90 relative z-10" />
              ) : (
                <Menu className="h-6 w-6 text-orange-600 transition-all duration-300 group-hover:scale-110 relative z-10" />
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;