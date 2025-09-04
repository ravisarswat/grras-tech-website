import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Clock, Users, ArrowRight, Filter, Award, Star } from 'lucide-react';
import EnhancedSEO from '../components/EnhancedSEO';

// Static Data Imports
import { categories as staticCategories } from '../data/categories';
import { courses as staticCourses } from '../data/courses';

const Courses = () => {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Load static data instead of API calls
    loadStaticData();
  }, []);

  // Load static data
  const loadStaticData = () => {
    try {
      setLoading(true);
      
      // Filter visible courses and add default values
      const visibleCourses = staticCourses
        .filter(course => course.visible !== false && course.title && course.slug)
        .map(course => ({
          ...course,
          // Ensure all required fields exist
          price: course.price || course.fees || 'Contact for pricing',
          overview: course.overview || course.description,
          highlights: course.highlights || [],
          learningOutcomes: course.learningOutcomes || [],
          careerRoles: course.careerRoles || []
        }));
      
      // Convert categories object to array format with counts
      const categoryArray = Object.entries(staticCategories).map(([slug, category]) => {
        const count = visibleCourses.filter(course => course.category === slug).length;
        return {
          ...category,
          slug: slug,
          id: slug,
          count: count
        };
      });
      
      // Add "All Courses" category
      const categoriesWithAll = [
        {
          id: 'all',
          slug: 'all',
          name: 'All Courses',
          title: 'All Courses',
          count: visibleCourses.length
        },
        ...categoryArray.filter(cat => cat.count > 0) // Only show categories with courses
      ];
      
      setCourses(visibleCourses);
      setCategories(categoriesWithAll);
      setFilteredCourses(visibleCourses);
      setLoading(false);
      
      console.log('✅ Static data loaded:', {
        courses: visibleCourses.length,
        categories: categoryArray.length
      });
      
    } catch (error) {
      console.error('Error loading static data:', error);
      setLoading(false);
    }
  };

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
        
        // Auto-scroll to category tabs section with perfect positioning
        setTimeout(() => {
          const categoryTabsSection = document.getElementById('course-categories-section');
          if (categoryTabsSection) {
            // Calculate perfect scroll position - tabs should be visible at top
            const rect = categoryTabsSection.getBoundingClientRect();
            const scrollTop = window.pageYOffset + rect.top - 100; // 100px offset from top
            
            window.scrollTo({
              top: scrollTop,
              behavior: 'smooth'
            });
            console.log(`🎯 Auto-scrolled to perfect position for: ${foundCategory.name}`);
          }
          
          // Then scroll to the specific selected tab (horizontally only)
          setTimeout(() => {
            const selectedButton = document.querySelector(`button[data-category-id="${foundCategory.id}"]`);
            if (selectedButton) {
              selectedButton.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
              });
              console.log(`🚀 Auto-scrolled to selected tab: ${foundCategory.name}`);
            }
          }, 800);
        }, 300);
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
        <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-20" style={{zIndex: 1, overflow: 'visible', transform: 'none'}}>
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
                  <span>View All {courses.length} Courses</span>
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
          <div className="mb-12" id="course-categories-section">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-3 sm:p-6 overflow-x-auto">
              <div className="flex space-x-2 sm:space-x-3 min-w-max">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    data-category-id={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`group relative px-4 sm:px-8 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-bold whitespace-nowrap transition-all duration-500 flex items-center gap-2 sm:gap-4 min-w-0 transform hover:scale-105 text-sm sm:text-base ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white shadow-2xl scale-110 ring-4 ring-orange-200'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-orange-50 hover:to-red-50 hover:text-orange-800 hover:shadow-xl border-2 border-gray-200 hover:border-orange-300'
                    }`}
                    style={{
                      animation: selectedCategory === category.id ? 'pulse 2s infinite' : 'none'
                    }}
                  >
                    {/* Enhanced Logo/Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 ${
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
                        <BookOpen className={`w-4 h-4 sm:w-7 sm:h-7 transition-all duration-300 ${
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

          <div className="mb-8 text-center" id="courses-grid-section">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredCourses.map((course, index) => (
                <div key={course.slug} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden hover:border-orange-200 transform hover:scale-[1.02] relative">
                  {/* Modern Header with gradient */}
                  <div className="h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600"></div>
                  
                  <div className="p-4">
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-orange-700 transition-colors duration-300 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                          {course.oneLiner}
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-300 transform group-hover:scale-110">
                          <span className="text-lg">
                            {course.icon || (() => {
                              const title = course.title.toLowerCase();
                              if (title.includes('devops')) return '🚀';
                              if (title.includes('aws') || title.includes('cloud')) return '☁️';
                              if (title.includes('kubernetes')) return '⚙️';
                              if (title.includes('red hat') || title.includes('rhcsa') || title.includes('rhce')) return '🐧';
                              if (title.includes('security') || title.includes('cyber')) return '🔒';
                              if (title.includes('data science') || title.includes('machine learning')) return '🤖';
                              if (title.includes('programming') || title.includes('development')) return '💻';
                              if (title.includes('degree') || title.includes('bca')) return '🎓';
                              return '📚';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compact Pricing */}
                    {course.fees && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-green-800">
                              {course.fees}
                            </p>
                            <p className="text-xs text-green-600 font-medium">
                              💳 EMI Available
                            </p>
                          </div>
                          <div className="inline-flex items-center px-2 py-1 bg-green-100 rounded-full">
                            <span className="text-xs font-bold text-green-700">Best Value</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Duration and Level - Compact */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center px-2 py-1 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg text-xs text-orange-800 font-medium border border-orange-200">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{course.duration || 'Self-paced'}</span>
                      </div>
                      <div className="flex items-center px-2 py-1 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg text-xs text-red-800 font-medium border border-red-200">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{course.level}</span>
                      </div>
                    </div>

                    {/* Compact Key Highlights */}
                    {course.highlights && course.highlights.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-900 mb-2 text-sm flex items-center">
                          <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-2">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          What You'll Learn:
                        </h4>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {course.highlights.slice(0, 2).map((highlight, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                              <span className="leading-relaxed font-medium">{highlight}</span>
                            </li>
                          ))}
                          {course.highlights.length > 2 && (
                            <li className="text-orange-600 font-medium text-xs">
                              +{course.highlights.length - 2} more topics
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center px-2 py-1 bg-blue-100 rounded-full">
                        <span className="text-xs font-medium text-blue-800 capitalize">
                          {categories.find(c => c.id === course.category)?.name || course.category}
                        </span>
                      </div>
                      {course.featured && (
                        <div className="inline-flex items-center px-2 py-1 bg-yellow-100 rounded-full">
                          <Star className="h-3 w-3 text-yellow-600 mr-1" />
                          <span className="text-xs font-bold text-yellow-700">Popular</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button - Compact */}
                    <Link
                      to={`/courses/${course.slug}`}
                      className="block w-full text-center bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-2 px-4 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform group-hover:scale-105 shadow-lg text-sm"
                    >
                      <div className="flex items-center justify-center">
                        <span>Enroll Now</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </Link>

                    {/* Compact Additional Info */}
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        <span>Certificate</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        <span>{course.mode || 'Online + Offline'}</span>
                      </div>
                    </div>
                  </div>
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