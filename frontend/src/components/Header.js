import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, BookOpen, Star, ArrowRight } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isMobileCoursesOpen, setIsMobileCoursesOpen] = useState(false);
  const { content } = useContent();
  const location = useLocation();

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
        <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              {/* CLEAN COMPANY LOGO */}
              <Link to="/" className="flex items-center group">
                <div className="flex flex-col items-center">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_db8831d9-1fc7-46ac-b819-59bb9fafe1eb/artifacts/lu0elrou_black%20logo.jpg" 
                    alt="GRRAS Solutions" 
                    className="h-14 w-auto transition-transform group-hover:scale-105" 
                  />
                  <span className="text-sm font-semibold text-orange-600 -mt-1 tracking-wide">
                    Solutions
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-6">
                {filteredNavigationItems.map((item) => (
                  <div key={item.name} className="relative">
                    {item.hasDropdown ? (
                      <button
                        className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium py-2"
                        onMouseEnter={() => setIsCoursesOpen(true)}
                      >
                        <span>{item.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        className={`relative text-gray-700 hover:text-orange-600 font-medium py-2 px-3 rounded-lg transition-all duration-200 ${
                          isActivePath(item.path) 
                            ? 'text-orange-600 bg-orange-50 shadow-sm' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {item.name}
                        {isActivePath(item.path) && (
                          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                        )}
                      </Link>
                    )}

                    {/* Premium Dynamic Dropdown - Fixed */}
                    {item.hasDropdown && isCoursesOpen && (
                      <div 
                        className="fixed top-16 left-0 right-0 w-full bg-white/98 backdrop-blur-xl shadow-2xl border-t border-gray-200 z-50 animate-in slide-in-from-top-4 duration-300 overflow-hidden"
                        onMouseEnter={() => setIsCoursesOpen(true)}
                        onMouseLeave={() => setIsCoursesOpen(false)}
                      >
                        <div className="container mx-auto px-4">
                          {/* Header with orange gradient */}
                          <div className="bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
                                  Technology Tracks
                                </h3>
                                <p className="text-sm text-gray-600">Choose your career path</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Full Categories Grid */}
                          <div className="p-6 max-h-96 overflow-y-auto">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {technologyTracks.length > 0 ? (
                              technologyTracks.map((track, index) => (
                                <Link
                                  key={track.id}
                                  to={track.path}
                                  className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-orange-200"
                                  onClick={() => setIsCoursesOpen(false)}
                                >
                                  <div className="p-4">
                                    <div className="flex items-center space-x-4">
                                      {/* Logo */}
                                      <div className="relative">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-orange-100 group-hover:to-red-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                                          <img 
                                            src={track.logo} 
                                            alt={track.name}
                                            className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                          />
                                          <div className="hidden w-7 h-7 bg-blue-100 rounded flex items-center justify-center">
                                            <BookOpen className="h-4 w-4 text-blue-600" />
                                          </div>
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold transform group-hover:scale-110 transition-transform duration-300">
                                          {track.courseCount}
                                        </div>
                                      </div>
                                      
                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors duration-300 truncate">
                                          {track.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 group-hover:text-orange-600 transition-colors duration-300">
                                          {track.courseCount} professional course{track.courseCount !== 1 ? 's' : ''} available
                                        </p>
                                      </div>
                                      
                                      {/* Arrow */}
                                      <div className="flex-shrink-0">
                                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Hover overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">No categories available</p>
                                <p className="text-sm">Categories will appear here once added</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Footer */}
                          <div className="mt-6 pt-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 -mx-6 px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Explore All Courses</p>
                                <p className="text-xs text-gray-500">16+ professional certifications</p>
                              </div>
                              <Link
                                to="/courses"
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                onClick={() => setIsCoursesOpen(false)}
                              >
                                <span>View All</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {/* Premium Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-100 transition-all duration-300 hover:shadow-md"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-blue-600" />
                ) : (
                  <Menu className="h-5 w-5 text-blue-600" />
                )}
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