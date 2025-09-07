import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Clock, Users, ArrowRight, Filter, Award, Star } from 'lucide-react';
import EnhancedSEO from '../components/EnhancedSEO';

// Static Data Imports
import { categories as staticCategories } from '../data/categories';
import { courses as staticCourses } from '../data/courses';

// Initialize data synchronously for SSR compatibility
const initializeStaticData = () => {
  try {
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
    
    return {
      courses: visibleCourses,
      categories: categoriesWithAll,
      filteredCourses: visibleCourses
    };
  } catch (error) {
    console.error('Error initializing static data:', error);
    return {
      courses: [],
      categories: [],
      filteredCourses: []
    };
  }
};

// Initialize data for SSR
const initialData = initializeStaticData();

const Courses = () => {
  const location = useLocation();
  const [courses, setCourses] = useState(initialData.courses);
  const [categories, setCategories] = useState(initialData.categories);
  const [filteredCourses, setFilteredCourses] = useState(initialData.filteredCourses);
  const [loading, setLoading] = useState(false); // Start with false since data is pre-loaded
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Only re-initialize if data is empty (edge case)
    if (courses.length === 0) {
      const freshData = initializeStaticData();
      setCourses(freshData.courses);
      setCategories(freshData.categories);
      setFilteredCourses(freshData.filteredCourses);
    }
    
    console.log('✅ Static data loaded:', {
      courses: courses.length,
      categories: categories.length
    });
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

  // Get category-specific SEO data
  const getCategorySEO = () => {
    const seoData = {
      'red-hat-technologies': {
        title: 'Red Hat Training & Certification | RHCSA & RHCE – GRRAS',
        description: 'Official Red Hat partner for RHCSA, RHCE, and OpenShift certifications. Hands-on labs & expert trainers at GRRAS Solutions Jaipur.',
        canonical: 'https://www.grras.tech/courses?tab=red-hat-technologies'
      },
      'aws-cloud-platform': {
        title: 'AWS Training & Certification | Cloud Courses – GRRAS',
        description: 'Learn AWS Cloud computing with Solutions Architect, SysOps & Developer Associate courses at GRRAS Jaipur.',
        canonical: 'https://www.grras.tech/courses?tab=aws-cloud-platform'
      },
      'devops-engineering': {
        title: 'DevOps Training & Certification in Jaipur – GRRAS',
        description: 'Learn DevOps with Docker, Kubernetes, Jenkins & CI/CD pipelines. Hands-on DevOps training with projects & job support at GRRAS Jaipur.',
        canonical: 'https://www.grras.tech/courses?tab=devops-engineering'
      },
      'microsoft-azure': {
        title: 'Microsoft Azure Training & Certification | GRRAS Jaipur',
        description: 'Become a certified Azure expert with GRRAS Azure Fundamentals & Administrator courses. Hands-on cloud labs included.',
        canonical: 'https://www.grras.tech/courses?tab=microsoft-azure'
      },
      'google-cloud-platform': {
        title: 'Google Cloud Training & Certification – GRRAS Jaipur',
        description: 'Learn Google Cloud with official certification-oriented training at GRRAS Jaipur. Build skills for cloud computing careers.',
        canonical: 'https://www.grras.tech/courses?tab=google-cloud-platform'
      },
      'data-science-ai': {
        title: 'Data Science & AI Training in Jaipur | GRRAS',
        description: 'Master Data Science, Python & Machine Learning with GRRAS AI training programs. Career-focused, project-based learning.',
        canonical: 'https://www.grras.tech/courses?tab=data-science-ai'
      },
      'programming-development': {
        title: 'Full Stack & Programming Courses | GRRAS Jaipur',
        description: 'Learn programming with Java & Full Stack development courses at GRRAS Jaipur. Build industry-ready coding skills.',
        canonical: 'https://www.grras.tech/courses?tab=programming-development'
      },
      'cyber-security': {
        title: 'Cyber Security Training & Certification | GRRAS Jaipur',
        description: 'Become a Cyber Security expert with Ethical Hacking & Fundamentals courses at GRRAS Jaipur. Hands-on labs & certification prep included.',
        canonical: 'https://www.grras.tech/courses?tab=cyber-security'
      },
      'degree-program': {
        title: 'BCA & MCA Degree Programs | GRRAS Jaipur',
        description: 'Earn UGC-approved BCA & MCA degrees with internship & stipend at GRRAS Jaipur. Industry-focused IT degree programs.',
        canonical: 'https://www.grras.tech/courses?tab=degree-program'
      }
    };

    const currentCategorySEO = seoData[selectedCategory];
    if (currentCategorySEO) {
      return currentCategorySEO;
    }
    
    return {
      title: 'IT & Cloud Courses in Jaipur | GRRAS Solutions',
      description: 'Explore top IT & Cloud training programs at GRRAS – DevOps, Red Hat, AWS, Data Science, Cyber Security, BCA & more. Hands-on learning with placements.',
      canonical: 'https://www.grras.tech/courses'
    };
  };

  const currentSEO = getCategorySEO();

  return (
    <>
      <EnhancedSEO 
        title={currentSEO.title}
        description={currentSEO.description}
        canonical={currentSEO.canonical}
        keywords="IT courses, cloud training, DevOps course, Red Hat certification, AWS training, data science course, programming courses"
        type="website"
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
                  {(() => {
                    const categoryH1s = {
                      'red-hat-technologies': 'Red Hat Certification Training at GRRAS',
                      'aws-cloud-platform': 'AWS Cloud Certification Training',
                      'devops-engineering': 'DevOps Training in Jaipur – GRRAS Solutions',
                      'microsoft-azure': 'Microsoft Azure Training Programs',
                      'google-cloud-platform': 'Google Cloud Platform Training',
                      'data-science-ai': 'Data Science & AI Training at GRRAS',
                      'programming-development': 'Programming & Development Courses',
                      'cyber-security': 'Cyber Security Training at GRRAS',
                      'degree-program': 'BCA & MCA Degree Programs'
                    };
                    return categoryH1s[selectedCategory] || 'Explore IT & Cloud Courses at GRRAS';
                  })()}
                </h1>
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
                  Featured Course Categories
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
          
          {/* Category-Specific H2 Sections */}
          {selectedCategory && selectedCategory !== 'all' && (
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {(() => {
                  const categoryContent = {
                    'red-hat-technologies': {
                      sections: [
                        { title: 'RHCSA Training', content: 'Master Red Hat System Administration with hands-on labs and real-world scenarios.' },
                        { title: 'RHCE Training', content: 'Advanced Red Hat Certified Engineer training for automation and configuration management.' },
                        { title: 'OpenShift Certification', content: 'Container orchestration and OpenShift platform management certification.' }
                      ]
                    },
                    'aws-cloud-platform': {
                      sections: [
                        { title: 'AWS Solutions Architect', content: 'Design and deploy scalable, highly available systems on AWS.' },
                        { title: 'AWS SysOps Administrator', content: 'Operate and manage AWS systems with monitoring and automation.' },
                        { title: 'AWS Developer Associate', content: 'Develop and maintain applications on the AWS platform.' }
                      ]
                    },
                    'devops-engineering': {
                      sections: [
                        { title: 'Why DevOps?', content: 'DevOps bridges development and operations for faster, more reliable software delivery.' },
                        { title: 'DevOps Course Curriculum', content: 'Comprehensive training in Docker, Kubernetes, Jenkins, and CI/CD pipelines.' },
                        { title: 'Hands-on Projects', content: 'Real-world projects and practical assignments to build your portfolio.' },
                        { title: 'Career Opportunities', content: 'Explore lucrative career paths in DevOps engineering and cloud automation.' }
                      ]
                    },
                    'microsoft-azure': {
                      sections: [
                        { title: 'Azure Fundamentals (AZ-900)', content: 'Start your Azure journey with fundamentals and core cloud concepts.' },
                        { title: 'Azure Administrator (AZ-104)', content: 'Advanced Azure administration and resource management skills.' }
                      ]
                    },
                    'google-cloud-platform': {
                      sections: [
                        { title: 'GCP Fundamentals', content: 'Learn Google Cloud Platform basics and core services.' },
                        { title: 'Advanced Google Cloud Modules', content: 'Deep dive into advanced GCP services and architecture patterns.' }
                      ]
                    },
                    'data-science-ai': {
                      sections: [
                        { title: 'Python for Data Science', content: 'Master Python programming for data manipulation and analysis.' },
                        { title: 'Machine Learning & AI', content: 'Build intelligent systems with ML algorithms and AI frameworks.' },
                        { title: 'Real-World Data Projects', content: 'Work on industry datasets and build a professional portfolio.' }
                      ]
                    },
                    'programming-development': {
                      sections: [
                        { title: 'Full Stack Development', content: 'End-to-end web development with modern frameworks and technologies.' },
                        { title: 'Java Programming', content: 'Master Java programming and enterprise application development.' }
                      ]
                    },
                    'cyber-security': {
                      sections: [
                        { title: 'Ethical Hacking & Penetration Testing', content: 'Learn ethical hacking techniques and penetration testing methodologies.' },
                        { title: 'Cyber Security Fundamentals', content: 'Build strong foundation in cybersecurity principles and practices.' }
                      ]
                    },
                    'degree-program': {
                      sections: [
                        { title: 'BCA Degree – 3 Years', content: 'Comprehensive Bachelor of Computer Applications with industry integration.' },
                        { title: 'MCA Degree – 2 Years', content: 'Advanced Master of Computer Applications with specialization options.' }
                      ]
                    }
                  };

                  const currentContent = categoryContent[selectedCategory];
                  if (!currentContent) return null;

                  return (
                    <div className="space-y-12">
                      {currentContent.sections.map((section, index) => (
                        <div key={index} className="text-center">
                          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            {section.title}
                          </h2>
                          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            {section.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </section>
          )}

          {/* Our Most Popular Certifications Section */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Our Most Popular Certifications
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Industry-recognized certifications that boost your career prospects and salary
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="text-3xl mb-2">🏆</div>
                  <h3 className="font-semibold text-gray-900">Red Hat RHCSA</h3>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="text-3xl mb-2">☁️</div>
                  <h3 className="font-semibold text-gray-900">AWS Certified</h3>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-3xl mb-2">🔧</div>
                  <h3 className="font-semibold text-gray-900">DevOps Expert</h3>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="font-semibold text-gray-900">Data Science</h3>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-600">
                  Get answers to common questions about our IT & Cloud courses
                </p>
              </div>
              
{(() => {
                const categoryFAQs = {
                  'red-hat-technologies': [
                    {
                      question: 'Is GRRAS an official Red Hat partner?',
                      answer: 'Yes, GRRAS is an authorized Red Hat Training Partner with official certification programs, hands-on labs, and expert trainers.'
                    },
                    {
                      question: 'What is the duration of RHCSA training?',
                      answer: 'RHCSA training typically takes 4-6 weeks with intensive hands-on labs and practical sessions to ensure certification success.'
                    },
                    {
                      question: 'Does GRRAS provide Red Hat exam vouchers?',
                      answer: 'Yes, we provide Red Hat exam vouchers as part of our certification packages along with extensive lab access and practice tests.'
                    }
                  ],
                  'aws-cloud-platform': [
                    {
                      question: 'Does GRRAS provide AWS certification guidance?',
                      answer: 'Yes, we provide comprehensive AWS certification guidance with hands-on labs, practice tests, and expert mentorship for all AWS certifications.'
                    },
                    {
                      question: 'What jobs can I get after AWS training?',
                      answer: 'AWS certified professionals can work as Cloud Architects, DevOps Engineers, SysOps Administrators, and Cloud Consultants with excellent salary packages.'
                    },
                    {
                      question: 'Do AWS courses include live labs?',
                      answer: 'Yes, all AWS courses include extensive hands-on labs with real AWS services and practical projects to ensure job-ready skills.'
                    }
                  ],
                  'devops-engineering': [
                    {
                      question: 'What skills will I learn in DevOps?',
                      answer: 'You will learn Docker, Kubernetes, Jenkins, CI/CD pipelines, Git, Ansible, Terraform, and cloud platforms like AWS and Azure.'
                    },
                    {
                      question: 'Is DevOps training beginner-friendly?',
                      answer: 'Yes, our DevOps course starts from basics and includes foundational concepts, making it suitable for beginners with basic IT knowledge.'
                    },
                    {
                      question: 'Does GRRAS provide DevOps placement support?',
                      answer: 'Yes, we provide dedicated placement assistance with our network of companies specifically looking for DevOps professionals.'
                    }
                  ],
                  'microsoft-azure': [
                    {
                      question: 'Which Azure certification is best for beginners?',
                      answer: 'Azure Fundamentals (AZ-900) is perfect for beginners, followed by Azure Administrator (AZ-104) for hands-on cloud administration skills.'
                    },
                    {
                      question: 'Does GRRAS provide Azure certification support?',
                      answer: 'Yes, we provide complete certification support including study materials, practice tests, and hands-on lab sessions for Azure exams.'
                    },
                    {
                      question: 'Are Azure courses practical-based?',
                      answer: 'Yes, all Azure courses include extensive hands-on labs with real Azure services and practical scenarios to build job-ready skills.'
                    }
                  ],
                  'google-cloud-platform': [
                    {
                      question: 'Does GRRAS offer Google Cloud certification?',
                      answer: 'Yes, we offer comprehensive Google Cloud training aligned with official certifications including Cloud Architect and Cloud Engineer.'
                    },
                    {
                      question: 'Is GCP in demand in India?',
                      answer: 'Yes, Google Cloud Platform is increasingly in demand in India with many companies adopting GCP services for their cloud infrastructure.'
                    },
                    {
                      question: 'What projects will I work on during GCP training?',
                      answer: 'You will work on real-world projects including cloud migration, data analytics, machine learning, and serverless application development.'
                    }
                  ],
                  'data-science-ai': [
                    {
                      question: 'Do I need coding knowledge for Data Science?',
                      answer: 'Basic programming knowledge helps, but our course starts from Python basics and progresses to advanced data science and ML concepts.'
                    },
                    {
                      question: 'What career roles can I get after Data Science training?',
                      answer: 'You can become a Data Scientist, ML Engineer, Data Analyst, AI Specialist, or Business Intelligence Analyst with excellent growth prospects.'
                    },
                    {
                      question: 'Does GRRAS provide AI project work?',
                      answer: 'Yes, our course includes multiple real-world AI/ML projects using industry datasets to build a strong portfolio for job applications.'
                    }
                  ],
                  'programming-development': [
                    {
                      question: 'Do programming courses include projects?',
                      answer: 'Yes, all programming courses include multiple hands-on projects, portfolio development, and real-world application building.'
                    },
                    {
                      question: 'Is Full Stack development in demand?',
                      answer: 'Yes, Full Stack developers are highly in demand with excellent salary packages and opportunities in startups and enterprises.'
                    },
                    {
                      question: 'Can I learn Java without prior coding experience?',
                      answer: 'Yes, our Java course starts from programming fundamentals and progresses to advanced concepts suitable for complete beginners.'
                    }
                  ],
                  'cyber-security': [
                    {
                      question: 'Does GRRAS provide CEH certification prep?',
                      answer: 'Yes, we provide comprehensive Certified Ethical Hacker (CEH) preparation with hands-on labs and practice tests.'
                    },
                    {
                      question: 'Are Cyber Security labs included?',
                      answer: 'Yes, all Cyber Security courses include extensive hands-on labs with real-world hacking scenarios and security tools.'
                    },
                    {
                      question: 'What career scope does Cyber Security offer?',
                      answer: 'Cyber Security offers excellent career opportunities as Security Analyst, Ethical Hacker, Security Consultant, and CISO roles.'
                    }
                  ],
                  'degree-program': [
                    {
                      question: 'Is BCA at GRRAS UGC-approved?',
                      answer: 'Yes, our BCA degree program is UGC-approved and recognized, providing you with a valid graduate degree for career advancement.'
                    },
                    {
                      question: 'Do MCA students also get internships?',
                      answer: 'Yes, both BCA and MCA students get guaranteed internship opportunities with stipend and industry exposure.'
                    },
                    {
                      question: 'What is the stipend structure?',
                      answer: 'Students receive monthly stipends during internship periods, ranging from ₹5,000 to ₹15,000 based on performance and company.'
                    }
                  ]
                };

                const currentFAQs = categoryFAQs[selectedCategory] || [
                  {
                    question: 'Which IT courses are most in demand in 2025?',
                    answer: 'DevOps, Cloud Computing (AWS, Azure), Data Science, Cybersecurity, and AI/ML are the most in-demand IT skills. Our courses are designed to meet current market demands.'
                  },
                  {
                    question: 'Does GRRAS provide beginner-friendly courses?',
                    answer: 'Yes, all our courses start from basics and progress to advanced levels. We provide foundation modules for students without technical backgrounds.'
                  },
                  {
                    question: 'Can I switch from one course to another?',
                    answer: 'Yes, we provide flexibility to switch courses based on your interests and career goals. Our counselors help you choose the right path.'
                  }
                ];

                return (
                  <div className="space-y-6">
                    {currentFAQs.map((faq, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Courses;