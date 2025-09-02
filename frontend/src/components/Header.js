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
              {/* PREMIUM COMPANY LOGO */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_db8831d9-1fc7-46ac-b819-59bb9fafe1eb/artifacts/lu0elrou_black%20logo.jpg" 
                    alt="GRRAS Solutions - Training Institute" 
                    className="h-12 w-auto transition-transform group-hover:scale-105" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    GRRAS
                  </span>
                  <span className="text-sm text-gray-600 font-medium -mt-1 tracking-wide">
                    Training Institute
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
                        className={`relative text-gray-700 hover:text-blue-600 font-medium py-2 px-3 rounded-lg transition-all duration-200 ${
                          isActivePath(item.path) 
                            ? 'text-blue-600 bg-blue-50 shadow-sm' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {item.name}
                        {isActivePath(item.path) && (
                          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></span>
                        )}
                      </Link>
                    )}

                    {/* Dynamic Dropdown - NO HARDCODE */}
                    {item.hasDropdown && isCoursesOpen && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-96 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-100 z-50 animate-in slide-in-from-top-2 duration-200"
                        onMouseEnter={() => setIsCoursesOpen(true)}
                        onMouseLeave={() => setIsCoursesOpen(false)}
                      >
                        <div className="p-6">
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                              Technology Tracks
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {technologyTracks.length > 0 ? (
                              technologyTracks.map((track) => (
                                <Link
                                  key={track.id}
                                  to={track.path}
                                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group border border-transparent hover:border-blue-100 hover:shadow-sm"
                                  onClick={() => setIsCoursesOpen(false)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                                      <img 
                                        src={track.logo} 
                                        alt={track.name}
                                        className="w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                      />
                                      <div className="hidden w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                        <BookOpen className="h-3 w-3 text-blue-600" />
                                      </div>
                                    </div>
                                    <span className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{track.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm px-2 py-1 bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-700 rounded-full transition-all duration-300 font-medium">
                                      {track.courseCount} courses
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                                  </div>
                                </Link>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p>No categories available</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-gray-100">
                            <Link
                              to="/courses"
                              className="flex items-center justify-between text-blue-600 hover:text-blue-700 font-medium"
                              onClick={() => setIsCoursesOpen(false)}
                            >
                              <span>Browse All Courses</span>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
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