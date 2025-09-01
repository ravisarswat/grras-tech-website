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
  const location = useLocation();

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

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="https://customer-assets.emergentagent.com/job_training-hub-29/artifacts/gl3ldkmg_white%20logo.png"
              alt="GRRAS Solutions"
              className="h-12 sm:h-16 w-auto bg-gray-900 rounded-lg p-2 hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">GRRAS Solutions</h1>
              <p className="text-xs sm:text-sm text-gray-600">Training Institute</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
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
                    
                    {/* Dropdown */}
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
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-6 border-t border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <div className="pt-6 space-y-3">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.path}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 mx-4 ${
                      isActivePath(item.path)
                        ? 'text-red-600 bg-red-50 shadow-sm border border-red-100'
                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50 hover:shadow-sm'
                    }`}
                    onClick={() => !item.hasDropdown && setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  
                  {/* Mobile Courses Submenu */}
                  {item.hasDropdown && (
                    <div className="pl-2 space-y-1 mt-3 mx-4">
                      {/* Company Logos Section */}
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">
                          Our Technology Partners
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                            <img 
                              src="https://images.unsplash.com/photo-1662052955098-042b46e60c2b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxjb21wYW55JTIwbG9nb3N8ZW58MHx8fHwxNzU2NjY5MTM2fDA&ixlib=rb-4.1.0&q=85"
                              alt="Microsoft" 
                              className="w-8 h-8 object-contain rounded"
                              onError={(e) => {
                                e.target.src = 'https://cdn-icons-png.flaticon.com/512/732/732076.png';
                              }}
                            />
                            <span className="text-xs font-medium text-gray-600 mt-1">Microsoft</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                            <img 
                              src="https://images.unsplash.com/photo-1662052955282-da15376f3919?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwzfHxjb21wYW55JTIwbG9nb3N8ZW58MHx8fHwxNzU2NjY5MTM2fDA&ixlib=rb-4.1.0&q=85"
                              alt="Azure" 
                              className="w-8 h-8 object-contain rounded"
                              onError={(e) => {
                                e.target.src = 'https://cdn-icons-png.flaticon.com/512/873/873120.png';
                              }}
                            />
                            <span className="text-xs font-medium text-gray-600 mt-1">Azure</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                            <img 
                              src="https://images.unsplash.com/photo-1496200186974-4293800e2c20?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nb3N8ZW58MHx8fHwxNzU2NjY5MTM2fDA&ixlib=rb-4.1.0&q=85"
                              alt="Slack" 
                              className="w-8 h-8 object-contain rounded"
                              onError={(e) => {
                                e.target.src = 'https://cdn-icons-png.flaticon.com/512/2111/2111615.png';
                              }}
                            />
                            <span className="text-xs font-medium text-gray-600 mt-1">Slack</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                            <img 
                              src="https://images.unsplash.com/photo-1662057168154-89300791ad6e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHx0ZWNobm9sb2d5JTIwbG9nb3N8ZW58MHx8fHwxNzU2NzE2MjA0fDA&ixlib=rb-4.1.0&q=85"
                              alt="Google" 
                              className="w-8 h-8 object-contain rounded"
                              onError={(e) => {
                                e.target.src = 'https://cdn-icons-png.flaticon.com/512/2875/2875404.png';
                              }}
                            />
                            <span className="text-xs font-medium text-gray-600 mt-1">Google</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">
                        Technology Tracks
                      </div>
                      
                      <Link
                        to="/courses?tab=redhat"
                        className="flex items-center px-4 py-3 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100 hover:shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg"
                            alt="Red Hat" 
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="w-2 h-2 bg-red-500 rounded-full" style={{display: 'none'}}></div>
                        </div>
                        <div>
                          <div className="font-medium">Red Hat Technologies</div>
                          <div className="text-xs text-gray-500">Enterprise Linux & OpenShift</div>
                        </div>
                      </Link>
                      
                      <Link
                        to="/courses?tab=aws"
                        className="flex items-center px-4 py-3 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100 hover:shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                            alt="AWS" 
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="w-2 h-2 bg-orange-500 rounded-full" style={{display: 'none'}}></div>
                        </div>
                        <div>
                          <div className="font-medium">AWS Cloud Platform</div>
                          <div className="text-xs text-gray-500">Cloud Computing & DevOps</div>
                        </div>
                      </Link>
                      
                      <Link
                        to="/courses?tab=kubernetes"
                        className="flex items-center px-4 py-3 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100 hover:shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg"
                            alt="Kubernetes" 
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="w-2 h-2 bg-blue-500 rounded-full" style={{display: 'none'}}></div>
                        </div>
                        <div>
                          <div className="font-medium">Kubernetes Ecosystem</div>
                          <div className="text-xs text-gray-500">Container Orchestration</div>
                        </div>
                      </Link>
                      
                      <Link
                        to="/courses?tab=devops"
                        className="flex items-center px-4 py-3 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100 hover:shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <img 
                            src="https://images.unsplash.com/photo-1662027044921-6febc57a0c53?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHw0fHxjb21wYW55JTIwbG9nb3N8ZW58MHx8fHwxNzU2NjY5MTM2fDA&ixlib=rb-4.1.0&q=85"
                            alt="DevOps" 
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="w-2 h-2 bg-green-500 rounded-full" style={{display: 'none'}}></div>
                        </div>
                        <div>
                          <div className="font-medium">DevOps Engineering</div>
                          <div className="text-xs text-gray-500">CI/CD & Infrastructure</div>
                        </div>
                      </Link>
                      
                      <Link
                        to="/courses?tab=cybersecurity"
                        className="flex items-center px-4 py-3 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100 hover:shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-5 h-5 flex items-center justify-center text-purple-600 text-lg">🛡️</div>
                        </div>
                        <div>
                          <div className="font-medium">Cybersecurity & Ethical Hacking</div>
                          <div className="text-xs text-gray-500">Security & Penetration Testing</div>
                        </div>
                      </Link>
                      
                      <Link
                        to="/courses?tab=programming"
                        className="flex items-center px-4 py-3 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100 hover:shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-5 h-5 flex items-center justify-center text-indigo-600 text-lg">💻</div>
                        </div>
                        <div>
                          <div className="font-medium">Programming & Development</div>
                          <div className="text-xs text-gray-500">Full Stack Development</div>
                        </div>
                      </Link>
                      
                      <Link
                        to="/courses?tab=degree"
                        className="flex items-center px-4 py-3 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100 hover:shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-5 h-5 flex items-center justify-center text-yellow-600 text-lg">🎓</div>
                        </div>
                        <div>
                          <div className="font-medium">Degree Programs</div>
                          <div className="text-xs text-gray-500">Bachelor's & Master's</div>
                        </div>
                      </Link>
                      
                      <div className="border-t border-gray-200 my-4"></div>
                      
                      <Link
                        to="/courses"
                        className="flex items-center px-4 py-3 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100 hover:shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <BookOpen className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">All Courses</div>
                          <div className="text-xs text-gray-500">Browse complete catalog</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-6 border-t border-gray-200 mx-4">
                <a
                  href="https://www.grras.tech/admissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center btn-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Apply Now
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;