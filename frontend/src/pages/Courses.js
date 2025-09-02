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
      const dynamicCategories = [
        {
          id: 'all',
          name: 'All Courses',
          count: processedCourses.length,
          slug: 'all',
          order: 0
        }
      ];

      // Add ONLY admin panel categories
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
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                GRRAS Certification Academy
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Transform your career with industry-recognized certifications and hands-on training programs designed for real-world success.
              </p>
              
              {/* DYNAMIC STATS - NO HARDCODE */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12 max-w-4xl mx-auto">
                {categories.slice(1, 6).map((category) => (
                  <div key={category.id} className="text-center">
                    <div className="text-2xl font-bold mb-2">{category.count}</div>
                    <div className="text-sm text-gray-200">{category.name}</div>
                  </div>
                ))}
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">95%</div>
                  <div className="text-sm text-gray-200">Success Rate</div>
                </div>
              </div>
            </div>
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
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl transform scale-105'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md hover:scale-102 border border-gray-200 hover:border-blue-200'
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
                            : 'text-gray-500 group-hover:text-blue-600'
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
                          : 'text-gray-500 group-hover:text-blue-600'
                      }`}>
                        {category.count} course{category.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {/* Active indicator */}
                    {selectedCategory === category.id && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md"></div>
                    )}
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                ))}
              </div>
              
              {/* Tab indicator line */}
              <div className="mt-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20"></div>
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
              {filteredCourses.map((course) => (
                <div key={course.slug} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {course.oneLiner}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-block text-2xl">{course.icon || '📚'}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{course.duration || 'Self-paced'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{course.level}</span>
                      </div>
                    </div>

                    {course.highlights && course.highlights.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Key Highlights:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {course.highlights.slice(0, 3).map((highlight, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-600 mr-2">•</span>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {course.categories && course.categories.length > 0 && (
                          <span>
                            {course.categories.map(catSlug => {
                              const category = categories.find(c => c.slug === catSlug);
                              return category ? category.name : catSlug;
                            }).join(' • ')}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/courses/${course.slug}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4 ml-1" />
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