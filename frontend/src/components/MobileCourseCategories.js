import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, BookOpen, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useContent } from '../contexts/ContentContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mobileExpandedCategories, setMobileExpandedCategories] = useState(new Set());
  const coursesButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { content } = useContent();

  // dropdown position
  const calculatePosition = () => {
    if (coursesButtonRef.current) {
      const rect = coursesButtonRef.current.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom + 8, left: rect.left });
    }
  };

  const openDropdown = () => { setIsCoursesOpen(true); calculatePosition(); };
  const closeDropdown = () => setIsCoursesOpen(false);

  // outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isCoursesOpen &&
        !coursesButtonRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) closeDropdown();
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isCoursesOpen]);

  // esc
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape' && isCoursesOpen) closeDropdown(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [isCoursesOpen]);

  // on scroll/resize
  useEffect(() => {
    const onChange = () => { if (isCoursesOpen) calculatePosition(); };
    window.addEventListener('scroll', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      window.removeEventListener('scroll', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [isCoursesOpen]);

  // close on route change
  useEffect(() => { closeDropdown(); }, [location.pathname]);

  // data
  const courseCategories = content?.courseCategories || {};
  const courses = content?.courses || [];

  const technologyTracks = Object.entries(courseCategories)
    .filter(([, category]) => category.visible !== false)
    .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999))
    .map(([slug, category]) => {
      const courseCount = courses.filter(c => Array.isArray(c.categories) && c.categories.includes(slug)).length;
      return {
        id: slug,
        name: category.name,
        path: `/courses?tab=${slug}`,
        courseCount,
        // 👇 desktop + mobile — dono ke liye same source
        logo: category.logo_url || category.logo || null,
      };
    });

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses', hasDropdown: true },
    { name: 'Placements', path: '/placements' },
    { name: 'Blog', path: '/blog' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActivePath = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:ring-2 focus:ring-blue-500">
        Skip to main content
      </a>

      <header className="bg-white/95 backdrop-blur-2xl shadow-2xl border-b border-orange-100/50 sticky top-0 relative overflow-hidden" style={{ zIndex: 9999 }}>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/40 via-white/95 to-red-50/40"></div>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 shadow-lg"></div>
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-24 h-24 bg-gradient-to-r from-red-400/10 to-orange-400/10 rounded-full blur-2xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center group relative">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-3xl opacity-0 group-hover:opacity-25 transition-all duration-700 blur-lg"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-300 to-red-300 rounded-2xl opacity-0 group-hover:opacity-30 transition-all duration-500 blur-sm"></div>
                <img
                  src="https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png"
                  alt="GRRAS Solutions Training Institute - IT & Cloud Training in Jaipur"
                  className="h-12 sm:h-16 lg:h-20 w-auto transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 relative z-10 drop-shadow-2xl filter rounded-lg sm:rounded-xl lg:rounded-2xl p-1 sm:p-1.5 lg:p-2 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-sm"
                  loading="eager" decoding="async" fetchpriority="high" width="160" height="80"
                />
              </div>
            </Link>

            {/* desktop nav */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative">
                  {item.hasDropdown ? (
                    <div className="relative">
                      <button
                        ref={coursesButtonRef}
                        className="flex items-center space-x-1 text-gray-800 hover:text-orange-600 font-semibold py-3 px-3 rounded-xl transition-all duration-200 group"
                        onMouseEnter={openDropdown}
                        onMouseLeave={() => {
                          setTimeout(() => {
                            if (!dropdownRef.current?.matches(':hover') && !coursesButtonRef.current?.matches(':hover')) {
                              closeDropdown();
                            }
                          }, 100);
                        }}
                        onClick={openDropdown}
                      >
                        <span className="text-base">{item.name}</span>
                        <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                        {isActivePath(item.path) && (
                          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`relative text-gray-800 hover:text-orange-600 font-bold py-2 px-3 rounded-lg transition-all duration-300 group text-sm ${
                        isActivePath(item.path)
                          ? 'text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 shadow-md ring-1 ring-orange-200'
                          : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:shadow-sm'
                      }`}
                    >
                      <span className="relative z-10">{item.name}</span>
                      {isActivePath(item.path) ? (
                        <>
                          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg"></span>
                          <div className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        </>
                      ) : (
                        <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* mobile menu btn */}
            <button
              className="lg:hidden p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group relative overflow-hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-sm"></div>
              {isMenuOpen ? (
                <X className="h-6 w-6 text-white transition-all duration-300 group-hover:rotate-90 relative z-10" />
              ) : (
                <Menu className="h-6 w-6 text-white transition-all duration-300 group-hover:scale-110 relative z-10" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-orange-100 shadow-xl" id="mobile-menu">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-2" role="navigation" aria-label="Mobile navigation">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  {item.hasDropdown ? (
                    <div className="bg-gray-50 rounded-xl p-1">
                      {/* header row */}
                      <button
                        onClick={() => {
                          const next = new Set(mobileExpandedCategories);
                          next.has('courses') ? next.delete('courses') : next.add('courses');
                          setMobileExpandedCategories(next);
                        }}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold shadow-md"
                      >
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5" />
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            {technologyTracks.length} categories
                          </span>
                          <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${mobileExpandedCategories.has('courses') ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* categories list */}
                      {mobileExpandedCategories.has('courses') && (
                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                          {technologyTracks.map((track) => {
                            const isExpanded = mobileExpandedCategories.has(track.id);
                            return (
                              <div key={track.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                  onClick={() => {
                                    const next = new Set(mobileExpandedCategories);
                                    next.has(track.id) ? next.delete(track.id) : next.add(track.id);
                                    setMobileExpandedCategories(next);
                                  }}
                                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center border border-orange-100 overflow-hidden">
                                      {track.logo ? (
                                        <img
                                          src={track.logo}
                                          alt={`${track.name} logo`}
                                          className="w-8 h-8 object-contain"
                                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                      ) : (
                                        <BookOpen className="h-6 w-6 text-orange-600" />
                                      )}
                                    </div>
                                    <div className="text-left">
                                      <div className="font-semibold text-gray-900 text-sm">{track.name}</div>
                                      <div className="text-xs text-gray-500">
                                        {track.courseCount} {track.courseCount === 1 ? 'course' : 'courses'}
                                      </div>
                                    </div>
                                  </div>
                                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                {isExpanded && (
                                  <div className="border-top border-gray-100 bg-gray-50 p-3">
                                    <Link
                                      to={track.path}
                                      className="block w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                                      onClick={() => setIsMenuOpen(false)}
                                    >
                                      View All {track.courseCount} {track.courseCount === 1 ? 'Course' : 'Courses'}
                                    </Link>
                                    <p className="text-xs text-gray-600 leading-relaxed px-1 mt-2">
                                      Explore {track.name.toLowerCase()} with hands-on training and industry certification.
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        isActivePath(item.path)
                          ? 'text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200'
                          : 'text-gray-800 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{item.name.charAt(0)}</span>
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* DESKTOP dropdown (portal) */}
      {isCoursesOpen && createPortal(
        <div
          ref={dropdownRef}
          className="dropdown-portal bg-white rounded-lg shadow-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200"
          style={{ position: 'fixed', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, zIndex: 100000, width: 'max-content', maxWidth: '95vw', minWidth: '280px' }}
          onMouseLeave={() => {
            setTimeout(() => { if (!coursesButtonRef.current?.matches(':hover')) closeDropdown(); }, 100);
          }}
        >
          <div className="p-4 sm:p-6 w-72 sm:w-80 max-w-[95vw]">
            <div className="flex items-center mb-4 pb-3 border-b border-orange-200">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-black text-orange-600 text-lg">Technology Tracks</h3>
              <div className="ml-auto">
                <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                  {technologyTracks.length} Categories
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {technologyTracks.length > 0 ? (
                technologyTracks.map((track, index) => (
                  <a
                    key={track.id}
                    href={track.path}
                    className="group flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-xl border border-transparent hover:border-orange-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={closeDropdown}
                    tabIndex={index + 1}
                  >
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        {track.logo ? (
                          <img
                            src={track.logo}
                            alt={track.name}
                            className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div className={`w-8 h-8 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-colors duration-300 ${track.logo ? 'hidden' : 'flex'}`}>
                          <BookOpen className="w-4 h-4 text-orange-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm group-hover:text-orange-700 transition-colors duration-200">
                          {track.name}
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-orange-600 transition-colors duration-200">
                          {track.courseCount > 0 ? (
                            <span className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                              {track.courseCount} courses available
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <div className="w-2 h-2 bg-orange-400 rounded-full mr-1.5"></div>
                              Coming soon
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-orange-500 flex-shrink-0 ml-2 group-hover:translate-x-1 group-hover:text-red-500 transition-all duration-300" />
                  </a>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">
                  <div className="animate-pulse">Loading categories...</div>
                  <div className="text-xs mt-2">Total courses: {courses.length}</div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href="/courses"
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg"
                onClick={closeDropdown}
              >
                🚀 View All Courses
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Header;
