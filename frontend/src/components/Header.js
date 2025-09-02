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
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              {/* ORIGINAL LOGO RESTORED */}
              <Link to="/" className="flex items-center space-x-3">
                <img 
                  src="https://grras.com/uploads/grras_logo.png" 
                  alt="GRRAS Solutions" 
                  className="h-10 w-auto" 
                />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900">GRRAS</span>
                  <span className="text-sm text-gray-600 -mt-1">Solutions</span>
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
                        className={`text-gray-700 hover:text-blue-600 font-medium py-2 ${
                          isActivePath(item.path) ? 'text-blue-600 border-b-2 border-blue-600' : ''
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}

                    {/* Dynamic Dropdown - NO HARDCODE */}
                    {item.hasDropdown && isCoursesOpen && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50"
                        onMouseEnter={() => setIsCoursesOpen(true)}
                        onMouseLeave={() => setIsCoursesOpen(false)}
                      >
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Technology Tracks</h3>
                          <div className="space-y-3">
                            {technologyTracks.length > 0 ? (
                              technologyTracks.map((track) => (
                                <Link
                                  key={track.id}
                                  to={track.path}
                                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                  onClick={() => setIsCoursesOpen(false)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
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
                                    </div>
                                    <span className="font-medium text-gray-900">{track.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">{track.courseCount} courses</span>
                                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
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

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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