import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, BookOpen, Star, ArrowRight } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { content } = useContent();

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
                      <button className="flex items-center space-x-1 text-gray-800 hover:text-orange-600 font-bold py-3 px-2">
                        <span>{item.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      {/* ALWAYS VISIBLE DROPDOWN FOR TESTING */}
                      <div className="absolute left-0 top-full mt-2 w-80 bg-red-100 border-4 border-red-500 p-4 z-50">
                        <h3 className="font-bold text-red-800 mb-2">DROPDOWN TEST</h3>
                        <div className="text-sm text-gray-700">
                          <p>Categories found: {technologyTracks.length}</p>
                          {technologyTracks.length > 0 ? (
                            <div>
                              {technologyTracks.slice(0, 3).map((track) => (
                                <div key={track.id} className="p-1 bg-white mb-1 rounded">
                                  {track.name} ({track.courseCount})
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-red-600">NO DATA FOUND!</div>
                          )}
                        </div>
                        <a href="/courses" className="block mt-2 p-2 bg-red-500 text-white text-center rounded">
                          Go to Courses
                        </a>
                      </div>
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