import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, BookOpen, Star, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useContent } from '../contexts/ContentContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const coursesButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { content } = useContent();

  // Calculate dropdown position
  const calculatePosition = () => {
    if (coursesButtonRef.current) {
      const rect = coursesButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
  };

  // Open dropdown
  const openDropdown = () => {
    setIsCoursesOpen(true);
    calculatePosition();
  };

  // Close dropdown
  const closeDropdown = () => {
    setIsCoursesOpen(false);
  };

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isCoursesOpen && 
          !coursesButtonRef.current?.contains(event.target) && 
          !dropdownRef.current?.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isCoursesOpen]);

  // Handle Esc key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isCoursesOpen) {
        closeDropdown();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isCoursesOpen]);

  // Handle scroll and resize
  useEffect(() => {
    const handleScrollResize = () => {
      if (isCoursesOpen) {
        calculatePosition();
      }
    };

    window.addEventListener('scroll', handleScrollResize);
    window.addEventListener('resize', handleScrollResize);
    return () => {
      window.removeEventListener('scroll', handleScrollResize);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [isCoursesOpen]);

  // Close on navigation
  useEffect(() => {
    closeDropdown();
  }, [location.pathname]);

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
      <header className="bg-white/98 backdrop-blur-xl shadow-2xl border-b border-orange-100/50 sticky top-0 relative overflow-hidden" style={{ zIndex: 9999 }}>
        {/* Beautiful Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/30 via-white to-red-50/30"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center group relative">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-all duration-500 blur-sm"></div>
                <img 
                  src="https://customer-assets.emergentagent.com/job_grras-course-manager/artifacts/9kv3gbea_black%20logo.jpg" 
                  alt="GRRAS" 
                  className="h-16 w-auto transition-all duration-500 group-hover:scale-110 group-hover:brightness-110 relative z-10 drop-shadow-lg" 
                />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative">
                  {item.hasDropdown ? (
                    <div className="relative">
                      <button
                        ref={coursesButtonRef}
                        className="flex items-center space-x-1 text-gray-800 hover:text-orange-600 font-bold py-3 px-2 rounded-xl transition-all duration-200"
                        onMouseEnter={openDropdown}
                        onMouseLeave={() => {
                          // Delay close to allow moving to dropdown
                          setTimeout(() => {
                            if (!dropdownRef.current?.matches(':hover') && !coursesButtonRef.current?.matches(':hover')) {
                              closeDropdown();
                            }
                          }, 100);
                        }}
                        onClick={openDropdown}
                      >
                        <span>{item.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
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