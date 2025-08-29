import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, ArrowRight, Filter } from 'lucide-react';
import SEO from '../components/SEO';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(courses.filter(course => 
        course.category === selectedCategory
      ));
    }
  }, [courses, selectedCategory]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/courses`);
      const coursesData = response.data.courses || [];
      
      // Use ONLY CMS data - no static fallbacks
      const coursesWithDefaults = coursesData.map(course => ({
        ...course,
        // Ensure required display fields have defaults
        oneLiner: course.oneLiner || course.tagline || 'Professional Training Course',
        overview: course.overview || course.description || '',
        icon: course.icon || getCategoryIcon(course.category),
        color: course.color || getCategoryColor(course.category),
        highlights: course.highlights || [],
        level: course.level || 'All Levels',
        category: course.category || 'other'
      }));
      
      // Filter only visible courses and sort by order
      const visibleCourses = coursesWithDefaults
        .filter(course => course.visible !== false)
        .sort((a, b) => (a.order || 999) - (b.order || 999));
      
      setCourses(visibleCourses);
      setFilteredCourses(visibleCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Simple icon mapping based on category
  const getCategoryIcon = (category) => {
    const icons = {
      'degree': '🎓',
      'programming': '💻',
      'cloud': '☁️',
      'certification': '🏆',
      'security': '🔒',
      'other': '📚'
    };
    return icons[category] || '📚';
  };

  // Simple color mapping based on category  
  const getCategoryColor = (category) => {
    const colors = {
      'degree': 'from-blue-500 to-indigo-600',
      'programming': 'from-green-500 to-teal-600',
      'cloud': 'from-purple-500 to-violet-600',
      'certification': 'from-red-500 to-pink-600',
      'security': 'from-red-600 to-red-800',
      'other': 'from-gray-500 to-gray-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const categories = [
    { id: 'all', name: 'All Courses', count: courses.length },
    { id: 'degree', name: 'Degree Programs', count: courses.filter(c => c.category === 'degree').length },
    { id: 'programming', name: 'Programming', count: courses.filter(c => c.category === 'programming').length },
    { id: 'cloud', name: 'Cloud & DevOps', count: courses.filter(c => c.category === 'cloud').length },
    { id: 'certification', name: 'Certifications', count: courses.filter(c => c.category === 'certification').length },
    { id: 'security', name: 'Security', count: courses.filter(c => c.category === 'security').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="IT Courses & Training Programs - GRRAS Solutions Jaipur"
        description="Explore comprehensive IT training courses in Jaipur. BCA degree, DevOps, Data Science, Python, Java, Red Hat certifications with placement assistance."
        keywords="IT courses Jaipur, computer training, BCA degree, DevOps course, Data Science training, programming courses"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="gradient-bg-primary text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Our Training Programs
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
                Industry-relevant courses designed to make you job-ready with hands-on experience and placement support
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/admissions" className="btn-secondary">
                  Start Your Journey
                </Link>
                <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-red-600">
                  Talk to Counselor
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700 font-medium">Filter by Category:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, index) => (
                <div
                  key={course.slug}
                  className="course-card relative group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Course Header */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${course.color}`}></div>
                  
                  <div className="p-6">
                    {/* Icon and Level */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{course.icon}</div>
                      <span className="text-xs font-medium text-white bg-gradient-to-r from-gray-600 to-gray-700 px-2 py-1 rounded-full">
                        {course.level}
                      </span>
                    </div>
                    
                    {/* Course Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {course.title || course.name}
                    </h3>
                    
                    <p className="text-red-600 font-medium mb-3 text-sm">
                      {course.oneLiner || course.tagline}
                    </p>
                    
                    {/* Description */}
                    <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                      {course.description}
                    </p>
                    
                    {/* Course Details */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration || 'Contact for details'}</span>
                      </div>
                      {course.fees && (
                        <div className="text-red-600 font-semibold">
                          {course.fees}
                        </div>
                      )}
                    </div>
                    
                    {/* Features */}
                    {course.highlights && course.highlights.length > 0 && (
                      <div className="mb-6">
                        <div className="grid grid-cols-2 gap-2">
                          {course.highlights.slice(0, 4).map((feature, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Tools Preview */}
                    {course.tools && course.tools.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">Key Technologies:</p>
                        <div className="flex flex-wrap gap-1">
                          {course.tools.slice(0, 3).map((tool, i) => (
                            <span 
                              key={i}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                            >
                              {tool}
                            </span>
                          ))}
                          {course.tools.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              +{course.tools.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* CTA Button */}
                    <Link
                      to={`/courses/${course.slug}`}
                      className="btn-primary w-full text-center text-sm group-hover:shadow-lg transition-all duration-300"
                    >
                      View Details & Download Syllabus
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600">
                  Try selecting a different category or contact us for custom training programs.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 gradient-bg-secondary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                We offer customized training programs for corporates and individuals. 
                Get in touch to discuss your specific requirements.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="btn-primary bg-white text-green-600 hover:bg-gray-100"
                >
                  Contact for Custom Training
                </Link>
                
                <Link
                  to="/admissions"
                  className="btn-outline border-white text-white hover:bg-white hover:text-green-600"
                >
                  Start Admission Process
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Courses;