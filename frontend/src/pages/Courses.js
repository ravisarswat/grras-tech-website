import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, ArrowRight, Filter } from 'lucide-react';
import SEO from '../components/SEO';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

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

      const dynamicCategories = [
        {
          id: 'all',
          name: 'All Courses',
          count: processedCourses.length,
          slug: 'all',
          order: 0
        }
      ];

      Object.entries(categoriesData)
        .filter(([, category]) => category.visible !== false)
        .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999))
        .forEach(([slug, category]) => {
          const categoryCount = processedCourses.filter(course => 
            course.categories && course.categories.includes(slug)
          ).length;
          
          if (categoryCount > 0) {
            dynamicCategories.push({
              id: slug,
              name: category.name,
              count: categoryCount,
              slug: slug,
              order: category.order || 999
            });
          }
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
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12 max-w-4xl mx-auto">
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
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
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
              <p className="text-gray-600">Try selecting a different category.</p>
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
                        to={`/course/${course.slug}`}
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