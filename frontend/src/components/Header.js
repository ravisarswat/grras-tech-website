import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronDown, 
  BookOpen, 
  Star, 
  ArrowRight 
} from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isMobileCoursesOpen, setIsMobileCoursesOpen] = useState(false);
  const location = useLocation();

  // Handle body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
      // Reset mobile courses dropdown when mobile menu closes
      setIsMobileCoursesOpen(false);
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  // Technology tracks with company logos
  const technologyTracks = [
    {
      id: 'redhat',
      name: 'Red Hat Technologies',
      path: '/courses/redhat',
      logo: 'https://logos-world.net/wp-content/uploads/2021/02/Red-Hat-Logo.png',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      hoverColor: 'hover:bg-red-100'
    },
    {
      id: 'aws',
      name: 'AWS Cloud Platform',
      path: '/courses/aws',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      hoverColor: 'hover:bg-orange-100'
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes Ecosystem',
      path: '/courses/kubernetes',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      id: 'devops',
      name: 'DevOps Engineering',
      path: '/courses/devops',
      logo: 'https://cdn-icons-png.flaticon.com/512/919/919853.png',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      hoverColor: 'hover:bg-green-100'
    },
    {
      id: 'cybersecurity',
      name: 'Cybersecurity & Ethical Hacking',
      path: '/courses/cybersecurity',
      logo: 'https://cdn-icons-png.flaticon.com/512/2092/2092063.png',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      id: 'programming',
      name: 'Programming & Development',
      path: '/courses/programming',
      logo: 'https://cdn-icons-png.flaticon.com/512/1005/1005141.png',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      hoverColor: 'hover:bg-indigo-100'
    },
    {
      id: 'degree',
      name: 'Degree Programs',
      path: '/courses/degree',
      logo: 'https://cdn-icons-png.flaticon.com/512/3595/3595030.png',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      hoverColor: 'hover:bg-yellow-100'
    }
  ];

  const courses = [
    { slug: 'bca-degree', name: 'BCA Degree Program' },
    { slug: 'devops-training', name: 'DevOps Training' },
    { slug: 'redhat-certifications', name: 'Red Hat Certifications' },
    { slug: 'data-science-machine-learning', name: 'Data Science & ML' },
    { slug: 'java-salesforce', name: 'Java & Salesforce' },
    { slug: 'python', name: 'Python' },
    { slug: 'c-cpp-dsa', name: 'C/C++ & DSA' },
    { slug: 'cyber-security', name: 'Cyber Security' }
  ];

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

  // Mobile navigation items (simplified for mobile UX - removed Blog and Testimonials)
  const mobileNavigationItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses', hasDropdown: true },
    { name: 'Learning Paths', path: '/learning-paths' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center -ml-2 lg:-ml-4">
            <img
              src="https://customer-assets.emergentagent.com/job_db8831d9-1fc7-46ac-b819-59bb9fafe1eb/artifacts/lu0elrou_black%20logo.jpg"
              alt="GRRAS Solutions"
              className="h-16 sm:h-20 w-auto hover:scale-105 transition-transform"
            />
            <div className="text-center -mt-3 sm:-mt-2">
              <h1 className="text-xs sm:text-sm font-bold text-gray-900">Solutions</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <div key={item.name} className="relative">
                {item.hasDropdown ? (
                  <div 
                    className="relative"
                    onMouseEnter={() => setIsCoursesOpen(true)}
                  >
                    <button
                      type="button"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActivePath(item.path) || location.pathname.startsWith('/courses')
                          ? 'text-red-600 bg-red-50'
                          : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                      }`}
                      onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isCoursesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Desktop Dropdown - keeping original */}
                    {isCoursesOpen && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-3 z-[9999]"
                        onMouseEnter={() => setIsCoursesOpen(true)}
                        onMouseLeave={() => {
                          setTimeout(() => setIsCoursesOpen(false), 300);
                        }}
                      >
                        {/* Header */}
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900">Course Categories</h3>
                        </div>
                        
                        {/* Course Categories */}
                        <div className="px-4 py-2">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Technology Tracks</h4>
                          
                          <div className="space-y-1">
                            <Link
                              to="/courses?tab=redhat"
                              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              onClick={() => setIsCoursesOpen(false)}
                            >
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg" 
                                alt="Red Hat" 
                                className="w-4 h-4 mr-3"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'inline';
                                }}
                              />
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-3" style={{display: 'none'}}></div>
                              <span>Red Hat Technologies</span>
                            </Link>
                            
                            <Link
                              to="/courses?tab=aws"
                              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              onClick={() => setIsCoursesOpen(false)}
                            >
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" 
                                alt="AWS" 
                                className="w-4 h-4 mr-3"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'inline';
                                }}
                              />
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" style={{display: 'none'}}></div>
                              <span>AWS Cloud Platform</span>
                            </Link>
                            
                            <Link
                              to="/courses?tab=kubernetes"
                              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              onClick={() => setIsCoursesOpen(false)}
                            >
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg" 
                                alt="Kubernetes" 
                                className="w-4 h-4 mr-3"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'inline';
                                }}
                              />
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" style={{display: 'none'}}></div>
                              <span>Kubernetes Ecosystem</span>
                            </Link>
                            
                            <Link
                              to="/courses?tab=devops"
                              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              onClick={() => setIsCoursesOpen(false)}
                            >
                              <div className="w-4 h-4 mr-3 flex items-center justify-center text-green-600">🔧</div>
                              <span>DevOps Engineering</span>
                            </Link>
                            
                            <Link
                              to="/courses?tab=cybersecurity"
                              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              onClick={() => setIsCoursesOpen(false)}
                            >
                              <div className="w-4 h-4 mr-3 flex items-center justify-center text-slate-600">🛡️</div>
                              <span>Cybersecurity & Ethical Hacking</span>
                            </Link>
                            
                            <Link
                              to="/courses?tab=programming"
                              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              onClick={() => setIsCoursesOpen(false)}
                            >
                              <div className="w-4 h-4 mr-3 flex items-center justify-center text-purple-600">💻</div>
                              <span>Programming & Development</span>
                            </Link>
                            
                            <Link
                              to="/courses?tab=degree"
                              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              onClick={() => setIsCoursesOpen(false)}
                            >
                              <div className="w-4 h-4 mr-3 flex items-center justify-center text-indigo-600">🎓</div>
                              <span>Degree Programs</span>
                            </Link>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        {/* All Courses Link */}
                        <Link
                          to="/courses"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          onClick={() => setIsCoursesOpen(false)}
                        >
                          <BookOpen className="h-4 w-4 mr-3 text-gray-400" />
                          <div>
                            <div className="font-medium">All Courses</div>
                            <div className="text-xs text-gray-500">Browse complete catalog</div>
                          </div>
                        </Link>
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        {/* Featured Courses */}
                        <div className="px-4 py-2">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Featured Courses</h4>
                          
                          <div className="space-y-1">
                            {courses.filter(course => course.featured).slice(0, 4).map((course) => (
                              <Link
                                key={course.slug}
                                to={`/courses/${course.slug}`}
                                className="flex items-center px-2 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                onClick={() => setIsCoursesOpen(false)}
                              >
                                <Star className="h-3 w-3 mr-3 text-yellow-500 fill-current" />
                                <div>
                                  <div className="font-medium">{course.title || course.name}</div>
                                  <div className="text-xs text-gray-500">{course.duration} • {course.fees}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        {/* Quick Links */}
                        <div className="px-4 py-2">
                          <Link
                            to="/learning-paths"
                            className="flex items-center px-2 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            onClick={() => setIsCoursesOpen(false)}
                          >
                            <ArrowRight className="h-4 w-4 mr-3 text-gray-400" />
                            <div>
                              <div className="font-medium">Learning Paths</div>
                              <div className="text-xs text-gray-500">Structured career journeys</div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                      isActivePath(item.path)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <a
              href="https://www.grras.tech/admissions"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Apply Now
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative p-3 rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 border border-transparent hover:border-red-100 hover:shadow-md group"
            >
              <div className="relative w-6 h-6">
                {isMenuOpen ? (
                  <X className="h-6 w-6 transform transition-transform duration-300 rotate-0 group-hover:rotate-90" />
                ) : (
                  <Menu className="h-6 w-6 transform transition-transform duration-300 group-hover:scale-110" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation - FIXED POSITIONING AND SCROLLING */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-[88px] lg:hidden bg-white z-40 overflow-y-auto" style={{height: 'calc(100vh - 88px)'}}>
            <div className="bg-gradient-to-b from-white via-gray-50 to-white min-h-full">
              <div className="p-4 space-y-3">
                {mobileNavigationItems.map((item, index) => (
                  <div key={item.name} className="animate-slideInUp" style={{animationDelay: `${index * 50}ms`}}>
                    {item.hasDropdown ? (
                      <button
                        onClick={() => setIsMobileCoursesOpen(!isMobileCoursesOpen)}
                        className={`block w-full px-4 py-3 mx-2 rounded-xl text-base font-medium transition-all duration-300 text-left ${
                          isActivePath(item.path)
                            ? 'text-white bg-gradient-to-r from-red-600 to-orange-500 shadow-lg'
                            : 'text-gray-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.name}</span>
                          <ChevronDown className={`h-4 w-4 text-gray-400 transform transition-transform ${isMobileCoursesOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        className={`block px-4 py-3 mx-2 rounded-xl text-base font-medium transition-all duration-300 ${
                          isActivePath(item.path)
                            ? 'text-white bg-gradient-to-r from-red-600 to-orange-500 shadow-lg'
                            : 'text-gray-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:shadow-md'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    )}
                    
                    {/* Mobile Courses Submenu */}
                    {item.hasDropdown && isMobileCoursesOpen && (
                      <div className="pl-2 space-y-2 mt-3 mx-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">
                          🎓 Course Categories
                        </div>
                        
                        <Link
                          to="/courses?tab=redhat"
                          className="flex items-center px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200 border border-transparent hover:shadow-lg group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-red-100 group-hover:bg-white rounded-xl flex items-center justify-center mr-3 transition-colors">
                            <img 
                              src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg"
                              alt="Red Hat" 
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="w-3 h-3 bg-red-500 rounded-full" style={{display: 'none'}}></div>
                          </div>
                          <div>
                            <div className="font-semibold">Red Hat Technologies</div>
                            <div className="text-xs opacity-80">Enterprise Linux & OpenShift</div>
                          </div>
                        </Link>
                        
                        <Link
                          to="/courses?tab=aws"
                          className="flex items-center px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-500 transition-all duration-200 border border-transparent hover:shadow-lg group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-orange-100 group-hover:bg-white rounded-xl flex items-center justify-center mr-3 transition-colors">
                            <img 
                              src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                              alt="AWS" 
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="w-3 h-3 bg-orange-500 rounded-full" style={{display: 'none'}}></div>
                          </div>
                          <div>
                            <div className="font-semibold">AWS Cloud Platform</div>
                            <div className="text-xs opacity-80">Cloud Computing & DevOps</div>
                          </div>
                        </Link>
                        
                        <Link
                          to="/courses?tab=kubernetes"
                          className="flex items-center px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-200 border border-transparent hover:shadow-lg group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-blue-100 group-hover:bg-white rounded-xl flex items-center justify-center mr-3 transition-colors">
                            <img 
                              src="https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg"
                              alt="Kubernetes" 
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="w-3 h-3 bg-blue-500 rounded-full" style={{display: 'none'}}></div>
                          </div>
                          <div>
                            <div className="font-semibold">Kubernetes Ecosystem</div>
                            <div className="text-xs opacity-80">Container Orchestration</div>
                          </div>
                        </Link>
                        
                        <Link
                          to="/courses?tab=devops"
                          className="flex items-center px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 transition-all duration-200 border border-transparent hover:shadow-lg group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-green-100 group-hover:bg-white rounded-xl flex items-center justify-center mr-3 transition-colors">
                            <div className="w-6 h-6 flex items-center justify-center text-green-600 text-xl">🔧</div>
                          </div>
                          <div>
                            <div className="font-semibold">DevOps Engineering</div>
                            <div className="text-xs opacity-80">CI/CD & Infrastructure</div>
                          </div>
                        </Link>
                        
                        <Link
                          to="/courses?tab=cybersecurity"
                          className="flex items-center px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 transition-all duration-200 border border-transparent hover:shadow-lg group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-purple-100 group-hover:bg-white rounded-xl flex items-center justify-center mr-3 transition-colors">
                            <div className="w-6 h-6 flex items-center justify-center text-purple-600 text-xl">🛡️</div>
                          </div>
                          <div>
                            <div className="font-semibold">Cybersecurity & Ethical Hacking</div>
                            <div className="text-xs opacity-80">Security & Penetration Testing</div>
                          </div>
                        </Link>
                        
                        <Link
                          to="/courses?tab=programming"
                          className="flex items-center px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 border border-transparent hover:shadow-lg group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-indigo-100 group-hover:bg-white rounded-xl flex items-center justify-center mr-3 transition-colors">
                            <div className="w-6 h-6 flex items-center justify-center text-indigo-600 text-xl">💻</div>
                          </div>
                          <div>
                            <div className="font-semibold">Programming & Development</div>
                            <div className="text-xs opacity-80">Full Stack Development</div>
                          </div>
                        </Link>
                        
                        <Link
                          to="/courses?tab=degree"
                          className="flex items-center px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 border border-transparent hover:shadow-lg group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-yellow-100 group-hover:bg-white rounded-xl flex items-center justify-center mr-3 transition-colors">
                            <div className="w-6 h-6 flex items-center justify-center text-yellow-600 text-xl">🎓</div>
                          </div>
                          <div>
                            <div className="font-semibold">Degree Programs</div>
                            <div className="text-xs opacity-80">Bachelor's & Master's</div>
                          </div>
                        </Link>
                        
                        <div className="border-t border-gray-300 my-4"></div>
                        
                        <Link
                          to="/courses"
                          className="flex items-center px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 transition-all duration-200 border border-transparent hover:shadow-lg group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-xl flex items-center justify-center mr-3 transition-colors">
                            <BookOpen className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-semibold">All Courses</div>
                            <div className="text-xs opacity-80">Browse complete catalog</div>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="pt-6 border-t border-gray-300 mx-2 animate-slideInUp" style={{animationDelay: '400ms'}}>
                  <a
                    href="https://www.grras.tech/admissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-4 text-lg font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:via-red-600 hover:to-orange-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🚀 Apply Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;