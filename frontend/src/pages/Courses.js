import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Clock, Users, ArrowRight, Filter } from 'lucide-react';
import SEO from '../components/SEO';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Courses = () => {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  // Handle URL parameters for category selection
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam && categories.length > 0) {
      // Check if the tab parameter matches any category
      const foundCategory = categories.find(cat => cat.slug === tabParam || cat.id === tabParam);
      if (foundCategory) {
        setSelectedCategory(foundCategory.id);
        console.log(`✅ Set selected category to: ${foundCategory.name} (${foundCategory.id})`);
      } else {
        // If tab parameter doesn't match any category, default to 'all'
        setSelectedCategory('all');
        console.log(`⚠️ Tab parameter '${tabParam}' not found, defaulting to 'all'`);
      }
    }
  }, [location.search, categories]);

  // Enhanced category selection with smooth scroll
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    
    // Scroll to the selected tab button smoothly
    setTimeout(() => {
      const selectedButton = document.querySelector(`button[data-category-id="${categoryId}"]`);
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }, 100);
  };

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(courses.filter(course => 
        course.categories && course.categories.includes(selectedCategory)
      ));
    }
  }, [courses, selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [coursesResponse, contentResponse] = await Promise.all([
        axios.get(`${API}/courses`),
        axios.get(`${API}/content`)
      ]);
      
      const coursesData = coursesResponse.data.courses || [];
      const contentData = contentResponse.data.content || {};
      const categoriesData = contentData.courseCategories || {};
      
      // Map course categories to available category slugs
      const mapCourseToCategories = (course) => {
        const courseCategory = course.category?.toLowerCase() || '';
        const courseTitle = course.title?.toLowerCase() || '';
        
        // Create mapping based on course content
        const categoryMapping = [];
        
        // AWS courses
        if (courseCategory.includes('cloud') && courseTitle.includes('aws')) {
          categoryMapping.push('aws');
        }
        
        // Red Hat courses  
        if (courseTitle.includes('red hat') || courseTitle.includes('rhcsa') || courseTitle.includes('rhce') || courseTitle.includes('openshift')) {
          categoryMapping.push('redhat');
        }
        
        // Kubernetes courses
        if (courseTitle.includes('kubernetes') || courseTitle.includes('cka') || courseTitle.includes('cks')) {
          categoryMapping.push('kubernetes');
        }
        
        // DevOps courses
        if (courseTitle.includes('devops')) {
          categoryMapping.push('devops');
        }
        
        // Cybersecurity courses
        if (courseCategory.includes('security') || courseTitle.includes('security') || courseTitle.includes('cybersecurity')) {
          categoryMapping.push('cybersecurity');
        }
        
        // Programming courses
        if (courseTitle.includes('programming') || courseTitle.includes('development') || courseTitle.includes('coding')) {
          categoryMapping.push('programming');
        }
        
        // Degree courses
        if (courseTitle.includes('degree') || courseTitle.includes('bca') || courseTitle.includes('certification')) {
          categoryMapping.push('degree');
        }
        
        // Fallback - if no specific mapping found, try to use original category
        if (categoryMapping.length === 0 && courseCategory) {
          // Map generic categories to specific ones
          if (courseCategory === 'cloud') categoryMapping.push('aws');
          if (courseCategory === 'security') categoryMapping.push('cybersecurity');  
          if (courseCategory === 'certification') categoryMapping.push('degree');
        }
        
        return categoryMapping;
      };

      const processedCourses = coursesData
        .filter(course => course.visible !== false)
        .map(course => ({
          ...course,
          oneLiner: course.oneLiner || course.tagline || 'Professional Training Course',
          overview: course.overview || course.description || '',
          highlights: course.highlights || [],
          level: course.level || 'All Levels',
          // Fix categories field - use intelligent mapping
          categories: course.categories || mapCourseToCategories(course)
        }))
        .sort((a, b) => (a.order || 999) - (b.order || 999));

      // ONLY DYNAMIC CATEGORIES - NO HARDCODE
      const dynamicCategories = [];

      // Add ONLY admin panel categories FIRST
      Object.entries(categoriesData)
        .filter(([, category]) => category.visible !== false)
        .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999))
        .forEach(([slug, category]) => {
          const categoryCount = processedCourses.filter(course => 
            course.categories && course.categories.includes(slug)
          ).length;
          
          // Show all categories even if 0 courses (user can assign later)
          dynamicCategories.push({
            id: slug,
            name: category.name,
            count: categoryCount,
            slug: slug,
            order: category.order || 999,
            logo: category.logo
          });
        });

      // Add "All Courses" at the END for better UX
      dynamicCategories.push({
        id: 'all',
        name: 'All Courses',
        count: processedCourses.length,
        slug: 'all',
        order: 9999 // Ensures it comes last
      });
      
      setCourses(processedCourses);
      setCategories(dynamicCategories);
      setFilteredCourses(processedCourses);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setCourses([]);
      setCategories([{ id: 'all', name: 'All Courses', count: 0, slug: 'all', order: 0 }]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Courses - GRRAS Solutions" 
        description="Browse our comprehensive course catalog"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Hero Section */}
        <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-20 overflow-hidden" style={{zIndex: 1}}>
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500/10 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-red-500/10 rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-yellow-500/10 rounded-full animate-ping"></div>
            <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-green-500/10 rounded-full animate-pulse"></div>
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-transparent to-red-600/20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* Main Heading with Animation */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-white via-blue-100 to-orange-200 bg-clip-text text-transparent leading-tight">
                  GRRAS Certification
                </h1>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-orange-300 mb-6">
                  Academy
                </h2>
              </div>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                🚀 Transform your career with <span className="font-bold text-orange-300">industry-recognized certifications</span> and 
                <span className="font-bold text-red-300"> hands-on training programs</span> designed for real-world success.
              </p>
              
              {/* Enhanced CTA Buttons with Smart Functionality */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <button 
                  onClick={() => {
                    // Scroll to most popular category (Red Hat with highest course count)
                    const popularCategory = categories.reduce((prev, current) => 
                      prev.count > current.count ? prev : current
                    );
                    if (popularCategory && popularCategory.id !== 'all') {
                      setSelectedCategory(popularCategory.id);
                      setTimeout(() => {
                        document.getElementById('course-categories-section')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }, 100);
                    }
                  }}
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
                >
                  <span>🔥 Most Popular ({categories.find(c => c.count === Math.max(...categories.filter(cat => cat.id !== 'all').map(cat => cat.count)))?.name || 'Courses'})</span>
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
                
                <button 
                  onClick={() => {
                    // Show all courses and scroll to courses grid
                    setSelectedCategory('all');
                    setTimeout(() => {
                      document.getElementById('courses-grid-section')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }, 100);
                  }}
                  className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20"
                >
                  <Users className="mr-3 h-5 w-5" />
                  <span>View All {processedCourses.length} Courses</span>
                </button>
              </div>
              
              {/* DYNAMIC STATS with Enhanced Design */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8 max-w-5xl mx-auto">
                {categories.slice(0, 5).map((category, index) => (
                  <div key={category.id} className="group bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20">
                    <div className="text-3xl font-black mb-2 bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">
                      {category.count}
                    </div>
                    <div className="text-sm text-gray-200 font-medium leading-tight">
                      {category.name.replace(/&/g, ' & ')}
                    </div>
                  </div>
                ))}
                <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20">
                  <div className="text-3xl font-black mb-2 bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                    95%
                  </div>
                  <div className="text-sm text-gray-200 font-medium">Success Rate</div>
                </div>
              </div>

              {/* Success Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span>✅ Industry Certified</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
                  <span>🎯 Job-Ready Skills</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
                  <span>🚀 Career Growth</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Wave Effect */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-20 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,120 C400,60 800,60 1200,120 L1200,120 L0,120 Z" fill="currentColor"></path>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Enhanced Premium Dynamic Category Tabs */}
          <div className="mb-12">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 overflow-x-auto">
              <div className="flex space-x-3 min-w-max">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    data-category-id={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`group relative px-8 py-5 rounded-2xl font-bold whitespace-nowrap transition-all duration-500 flex items-center gap-4 min-w-0 transform hover:scale-105 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white shadow-2xl scale-110 ring-4 ring-orange-200'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-orange-50 hover:to-red-50 hover:text-orange-800 hover:shadow-xl border-2 border-gray-200 hover:border-orange-300'
                    }`}
                    style={{
                      animation: selectedCategory === category.id ? 'pulse 2s infinite' : 'none'
                    }}
                  >
                    {/* Enhanced Logo/Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      selectedCategory === category.id 
                        ? 'bg-white/30 backdrop-blur-sm shadow-lg' 
                        : 'bg-white group-hover:bg-orange-100 shadow-md border border-gray-200 group-hover:border-orange-300'
                    }`}>
                      {category.logo ? (
                        <img 
                          src={category.logo} 
                          alt={category.name}
                          className="w-7 h-7 object-contain filter group-hover:brightness-110"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <BookOpen className={`w-7 h-7 transition-all duration-300 ${
                          selectedCategory === category.id 
                            ? 'text-white scale-110' 
                            : 'text-gray-600 group-hover:text-orange-600 group-hover:scale-110'
                        }`} />
                      )}
                    </div>
                    
                    {/* Enhanced Category Info */}
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-base font-black truncate mb-1">
                        {category.name}
                      </span>
                      <span className={`text-sm font-semibold ${
                        selectedCategory === category.id 
                          ? 'text-white/90' 
                          : 'text-gray-500 group-hover:text-orange-600'
                      }`}>
                        {category.count} course{category.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {/* Enhanced Active indicator */}
                    {selectedCategory === category.id && (
                      <>
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full shadow-lg animate-bounce"></div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-md"></div>
                      </>
                    )}
                    
                    {/* Enhanced Hover effect overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                      selectedCategory === category.id ? 'opacity-20' : ''
                    }`}></div>
                    
                    {/* Sparkle effect for active tab */}
                    {selectedCategory === category.id && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Enhanced Tab indicator line with gradient */}
              <div className="mt-6 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-full shadow-lg"></div>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              {selectedCategory === 'all' ? (
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  🎯 All Courses
                </span>
              ) : (
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              )}
            </h2>
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl shadow-lg">
              <span className="text-lg font-bold text-orange-800">
                {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''} Available
              </span>
              {filteredCourses.length > 0 && (
                <div className="ml-3 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-lg">
                <BookOpen className="h-20 w-20 text-orange-600" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">No courses found</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
                {selectedCategory === 'all' 
                  ? '🚀 New courses are being added regularly. Check back soon!' 
                  : '📚 This exciting category is ready for courses. Add some from the admin panel to get started!'
                }
              </p>
              <div className="mt-8">
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <span>View All Courses</span>
                  <ArrowRight className="ml-3 h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredCourses.map((course, index) => (
                <div key={course.slug} className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden hover:border-orange-200 transform hover:scale-[1.05] hover:-translate-y-2 relative">
                  {/* Enhanced Header with gradient and glow effect */}
                  <div className="h-3 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 animate-pulse opacity-50"></div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight group-hover:text-orange-700 transition-colors duration-300 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-base leading-relaxed line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">
                          {course.oneLiner}
                        </p>
                      </div>
                      <div className="ml-6 flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 via-red-50 to-orange-100 rounded-2xl flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                          <span className="text-3xl group-hover:scale-125 transition-transform duration-500 filter drop-shadow-sm">
                            {course.icon || '📚'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Course Meta */}
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl text-sm text-orange-800 font-bold border border-orange-200 shadow-sm">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{course.duration || 'Self-paced'}</span>
                      </div>
                      <div className="flex items-center px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl text-sm text-red-800 font-bold border border-red-200 shadow-sm">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{course.level}</span>
                      </div>
                    </div>

                    {/* Enhanced Key Highlights */}
                    {course.highlights && course.highlights.length > 0 && (
                      <div className="mb-8">
                        <h4 className="font-black text-gray-900 mb-4 text-base flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          What You'll Master:
                        </h4>
                        <ul className="text-sm text-gray-700 space-y-3">
                          {course.highlights.slice(0, 3).map((highlight, index) => (
                            <li key={index} className="flex items-start group-hover:translate-x-1 transition-transform duration-300">
                              <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-sm"></div>
                              <span className="leading-relaxed font-medium">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Enhanced Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      {/* Enhanced Categories */}
                      <div className="flex flex-wrap gap-2">
                        {course.categories && course.categories.length > 0 && (
                          course.categories.slice(0, 2).map(catSlug => {
                            const category = categories.find(c => c.slug === catSlug);
                            return category ? (
                              <span key={catSlug} className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs rounded-xl font-bold shadow-sm border border-gray-300 hover:from-orange-100 hover:to-red-100 hover:text-orange-800 transition-all duration-300">
                                {category.name}
                              </span>
                            ) : null;
                          })
                        )}
                      </div>
                      
                      {/* Enhanced CTA Button */}
                      <Link
                        to={`/courses/${course.slug}`}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white text-sm font-black rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-3xl group relative overflow-hidden"
                      >
                        {/* Button Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <span className="relative z-10">Explore</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                        
                        {/* Sparkle effect */}
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Card hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Courses;