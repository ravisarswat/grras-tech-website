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
      
      const processedCourses = coursesData
        .filter(course => course.visible !== false)
        .map(course => ({
          ...course,
          oneLiner: course.oneLiner || course.tagline || 'Professional Training Course',
          overview: course.overview || course.description || '',
          highlights: course.highlights || [],
          level: course.level || 'All Levels',
          categories: course.categories || []
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
        <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-20 overflow-hidden">
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
              
              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <button className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl">
                  <span>Explore Courses</span>
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
                
                <button className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20">
                  <Users className="mr-3 h-5 w-5" />
                  <span>Join 5000+ Students</span>
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
          {/* Premium Dynamic Category Tabs */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 overflow-x-auto">
              <div className="flex space-x-2 min-w-max">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group relative px-6 py-4 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-3 min-w-0 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl transform scale-105'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md hover:scale-102 border border-gray-200 hover:border-orange-200'
                    }`}
                  >
                    {/* Logo/Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      selectedCategory === category.id 
                        ? 'bg-white/20' 
                        : 'bg-white group-hover:bg-blue-50'
                    }`}>
                      {category.logo ? (
                        <img 
                          src={category.logo} 
                          alt={category.name}
                          className="w-5 h-5 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <BookOpen className={`w-5 h-5 ${
                          selectedCategory === category.id 
                            ? 'text-white' 
                            : 'text-gray-500 group-hover:text-orange-600'
                        }`} />
                      )}
                    </div>
                    
                    {/* Category Info */}
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-bold truncate">
                        {category.name}
                      </span>
                      <span className={`text-xs ${
                        selectedCategory === category.id 
                          ? 'text-white/80' 
                          : 'text-gray-500 group-hover:text-orange-600'
                      }`}>
                        {category.count} course{category.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {/* Active indicator */}
                    {selectedCategory === category.id && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md"></div>
                    )}
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                ))}
              </div>
              
              {/* Tab indicator line */}
              <div className="mt-4 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-20"></div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'All Courses' : categories.find(c => c.id === selectedCategory)?.name} 
              <span className="text-gray-500 ml-2">({filteredCourses.length})</span>
            </h2>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <BookOpen className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'No courses available yet.' 
                  : 'This category has no courses assigned yet. Add courses from the admin panel.'
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, index) => (
                <div key={course.slug} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:border-blue-200 transform hover:scale-[1.02]">
                  {/* Header with gradient */}
                  <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-orange-700 transition-colors duration-300">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {course.oneLiner}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl flex items-center justify-center group-hover:from-orange-100 group-hover:to-red-100 transition-all duration-300">
                          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                            {course.icon || '📚'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Course Meta */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center px-3 py-1 bg-orange-50 rounded-full text-sm text-orange-700 font-medium">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{course.duration || 'Self-paced'}</span>
                      </div>
                      <div className="flex items-center px-3 py-1 bg-red-50 rounded-full text-sm text-red-700 font-medium">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{course.level}</span>
                      </div>
                    </div>

                    {/* Key Highlights */}
                    {course.highlights && course.highlights.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">What You'll Learn:</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                          {course.highlights.slice(0, 3).map((highlight, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="leading-relaxed">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {/* Categories */}
                      <div className="flex flex-wrap gap-1">
                        {course.categories && course.categories.length > 0 && (
                          course.categories.slice(0, 2).map(catSlug => {
                            const category = categories.find(c => c.slug === catSlug);
                            return category ? (
                              <span key={catSlug} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                {category.name}
                              </span>
                            ) : null;
                          })
                        )}
                      </div>
                      
                      {/* CTA Button */}
                      <Link
                        to={`/courses/${course.slug}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <span>Learn More</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
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