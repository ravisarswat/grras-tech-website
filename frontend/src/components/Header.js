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
                    {/* Enhanced SVG Logo for better branding */}
                    <div className="relative w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-xl flex items-center justify-center relative overflow-hidden">
                        {/* Modern geometric logo design */}
                        <div className="relative w-8 h-8">
                          <div className="absolute inset-0 bg-white/30 rounded-lg transform rotate-12"></div>
                          <div className="absolute inset-1 bg-white/60 rounded-md transform -rotate-6"></div>
                          <div className="absolute inset-2 bg-white rounded-sm flex items-center justify-center">
                            <span className="text-orange-600 font-black text-sm">G</span>
                          </div>
                        </div>
                        {/* Animated accent */}
                        <div className="absolute top-1 right-1 w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
                      </div>
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

                    {/* Optimized Premium Dynamic Dropdown */}
                    {item.hasDropdown && isCoursesOpen && createPortal(
                      <div 
                        data-dropdown="courses"
                        className="fixed top-20 left-0 right-0 w-full bg-white/98 backdrop-blur-xl shadow-2xl border-t-4 border-orange-500 animate-in slide-in-from-top-2 duration-200 overflow-hidden"
                        onMouseEnter={handleDropdownOpen}
                        onMouseLeave={() => handleDropdownClose(200)}
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,247,237,0.98) 50%, rgba(254,242,242,0.98) 100%)',
                          zIndex: 999999,
                          position: 'fixed'
                        }}
                      >
                        <div className="container mx-auto px-4">
                          {/* Enhanced Header with premium styling */}
                          <div className="bg-gradient-to-r from-orange-100 via-red-50 to-orange-100 px-8 py-6 border-b border-orange-200 relative overflow-hidden">
                            {/* Background pattern */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute top-2 left-10 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
                              <div className="absolute top-8 right-20 w-3 h-3 bg-red-400 rounded-full animate-bounce"></div>
                              <div className="absolute bottom-4 left-1/3 w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                            </div>
                            
                            <div className="flex items-center space-x-4 relative z-10">
                              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                                <BookOpen className="h-7 w-7 text-white drop-shadow-lg" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-black bg-gradient-to-r from-orange-700 via-red-700 to-orange-800 bg-clip-text text-transparent mb-1">
                                  Technology Tracks
                                </h3>
                                <p className="text-base text-gray-700 font-medium">🚀 Choose your career path & transform your future</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced Categories Grid */}
                          <div className="p-8 max-h-96 overflow-y-auto">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {technologyTracks.length > 0 ? (
                              technologyTracks.map((track, index) => (
                                <Link
                                  key={track.id}
                                  to={track.path}
                                  className="group relative overflow-hidden rounded-2xl border-2 border-gray-100 bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:via-white hover:to-red-50 transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] hover:border-orange-300 transform"
                                  onClick={() => setIsCoursesOpen(false)}
                                  style={{
                                    animationDelay: `${index * 100}ms`
                                  }}
                                >
                                  <div className="p-6">
                                    <div className="flex items-center space-x-5">
                                      {/* Enhanced Logo */}
                                      <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 via-white to-gray-100 group-hover:from-orange-100 group-hover:via-red-50 group-hover:to-orange-100 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-2xl border-2 border-gray-200 group-hover:border-orange-300">
                                          <img 
                                            src={track.logo} 
                                            alt={track.name}
                                            className="w-9 h-9 object-contain group-hover:scale-125 transition-all duration-500 filter group-hover:brightness-110"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                          />
                                          <div className="hidden w-9 h-9 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                                            <BookOpen className="h-5 w-5 text-orange-600" />
                                          </div>
                                        </div>
                                        
                                        {/* Enhanced Course Count Badge */}
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-black transform group-hover:scale-125 transition-all duration-300 shadow-xl group-hover:shadow-2xl border-2 border-white">
                                          {track.courseCount}
                                          
                                          {/* Sparkle effect */}
                                          <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                                        </div>
                                      </div>
                                      
                                      {/* Enhanced Content */}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-lg text-gray-900 group-hover:text-orange-700 transition-colors duration-300 mb-2 line-clamp-1">
                                          {track.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 group-hover:text-orange-600 transition-colors duration-300 font-semibold">
                                          🎯 {track.courseCount} professional course{track.courseCount !== 1 ? 's' : ''} available
                                        </p>
                                        
                                        {/* Progress indicator */}
                                        <div className="mt-3 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform group-hover:scale-x-100 transition-transform duration-700 origin-left"
                                            style={{ width: `${Math.min((track.courseCount / 10) * 100, 100)}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                      
                                      {/* Enhanced Arrow */}
                                      <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-orange-100 group-hover:to-red-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Enhanced hover overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                  
                                  {/* Shine effect */}
                                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                  </div>
                                </Link>
                              ))
                            ) : (
                              <div className="col-span-2 text-center py-12 text-gray-500">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                  <BookOpen className="h-10 w-10 text-orange-400" />
                                </div>
                                <p className="font-bold text-lg mb-2">No categories available</p>
                                <p className="text-sm">Categories will appear here once added via admin panel</p>
                              </div>
                            )}
                          </div>
                          
                          
                          {/* Enhanced Footer */}
                          <div className="mt-8 pt-6 border-t-2 border-orange-200 bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 -mx-8 px-8 py-6 relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute inset-0 opacity-20">
                              <div className="absolute top-2 left-8 w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
                              <div className="absolute bottom-2 right-12 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                            </div>
                            
                            <div className="flex items-center justify-between relative z-10">
                              <div>
                                <p className="text-lg font-black text-gray-800 mb-1">🚀 Explore All Courses</p>
                                <p className="text-sm text-gray-600 font-semibold">15+ professional certifications • Industry-recognized training</p>
                              </div>
                              <Link
                                to="/courses"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white text-base font-black rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-3xl group relative overflow-hidden"
                                onClick={() => setIsCoursesOpen(false)}
                              >
                                {/* Button shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                <span className="relative z-10">View All Courses</span>
                                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                                
                                {/* Sparkle effects */}
                                <div className="absolute top-1 right-2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                                <div className="absolute bottom-1 left-2 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-200"></div>
                              </Link>
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>, document.body
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