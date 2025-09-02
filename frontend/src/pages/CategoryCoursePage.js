import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowRight, 
  Star, 
  Clock, 
  Users, 
  CheckCircle,
  TrendingUp,
  Award,
  Target,
  Briefcase
} from 'lucide-react';
import SEO from '../components/SEO';
import { useContent } from '../contexts/ContentContext';

const CategoryCoursePage = () => {
  const { categorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  
  const [categoryStats, setCategoryStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageDuration: '',
    placementRate: '95%'
  });

  useEffect(() => {
    fetchCategoryData();
  }, [categorySlug]);

  const fetchCategoryData = async () => {
    try {
      // Fetch both categories and courses
      const [categoriesResponse, coursesResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/categories`),
        fetch(`${BACKEND_URL}/api/courses`)
      ]);
      
      if (categoriesResponse.ok && coursesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const coursesData = await coursesResponse.json();
        
        // Find the specific category
        const foundCategory = categoriesData.categories.find(cat => cat.slug === categorySlug);
        if (foundCategory) {
          setCategory(foundCategory);
          
          // Filter courses for this category
          const categoryCourses = coursesData.courses.filter(course => 
            course.visible !== false && course.categories && course.categories.includes(categorySlug)
          );
          
          setCourses(categoryCourses);
          
          // Update stats
          setCategoryStats({
            totalCourses: categoryCourses.length,
            totalStudents: 500 + (categoryCourses.length * 50),
            averageDuration: categoryCourses.length > 0 ? '3-6 months' : 'N/A',
            placementRate: '95%'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
          <p className="text-gray-600 mb-6">The requested course category could not be found.</p>
          <Link to="/courses" className="btn-primary">
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  const categoryCourses = category.courses
    ?.map(courseSlug => courses.find(c => c.slug === courseSlug))
    .filter(Boolean)
    .filter(course => course.visible !== false) || [];

  // Get featured course
  const featuredCourse = categoryCourses.find(course => course.featured) || categoryCourses[0];

  return (
    <>
      <SEO
        title={category.seo?.title || `${category.name} Courses - GRRAS Solutions`}
        description={category.seo?.description || category.description}
        keywords={category.seo?.keywords || `${category.name}, IT training, certification courses`}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section 
          className="relative py-24 text-white overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${category.color}, ${category.color}dd), linear-gradient(45deg, #1f2937, #374151)`
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  {category.name} Training
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Master {category.name}
                </h1>
                
                <p className="text-xl text-gray-100 mb-8 leading-relaxed">
                  {category.description}
                </p>

                {/* Category Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{categoryStats.totalCourses}</div>
                    <div className="text-sm text-gray-200">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{categoryStats.totalStudents}+</div>
                    <div className="text-sm text-gray-200">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{categoryStats.averageDuration}</div>
                    <div className="text-sm text-gray-200">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{categoryStats.placementRate}</div>
                    <div className="text-sm text-gray-200">Placement</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to={`/courses?category=${categorySlug}`} 
                    className="btn-white inline-flex items-center justify-center gap-2"
                  >
                    View All Courses
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link 
                    to="/contact" 
                    className="btn-outline border-white text-white hover:bg-white hover:text-gray-900 inline-flex items-center justify-center gap-2"
                  >
                    Get Free Consultation
                  </Link>
                </div>
              </div>

              {/* Featured Course Card */}
              {featuredCourse && (
                <div className="animate-fade-in-right">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-100">Featured Course</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {featuredCourse.title}
                    </h3>
                    
                    <p className="text-gray-200 mb-6 leading-relaxed">
                      {featuredCourse.oneLiner}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-200">
                        <Clock className="h-4 w-4" />
                        {featuredCourse.duration}
                      </div>
                      <div className="flex items-center gap-2 text-gray-200">
                        <Users className="h-4 w-4" />
                        {featuredCourse.level}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">
                        {featuredCourse.fees}
                      </span>
                      <Link
                        to={`/courses/${featuredCourse.slug}`}
                        className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why Choose This Category */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose {category.name}?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Build expertise in one of the most in-demand technology domains with comprehensive training and hands-on experience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">High Demand Skills</h3>
                <p className="text-gray-600">
                  Master technologies that are highly sought after by top employers across industries.
                </p>
              </div>
              
              <div className="text-center p-8 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Industry Certifications</h3>
                <p className="text-gray-600">
                  Gain recognized certifications that validate your expertise and enhance your career prospects.
                </p>
              </div>
              
              <div className="text-center p-8 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Career Growth</h3>
                <p className="text-gray-600">
                  Open doors to lucrative career opportunities with proven placement support and mentorship.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Courses in This Category */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {category.name} Courses
              </h2>
              <p className="text-xl text-gray-600">
                Choose from our comprehensive selection of {category.name.toLowerCase()} training programs
              </p>
            </div>

            {categoryCourses.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses available</h3>
                <p className="text-gray-600 mb-6">
                  Courses for this category are being updated. Please check back soon.
                </p>
                <Link to="/courses" className="btn-primary">
                  Browse All Courses
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryCourses.map((course) => (
                  <div key={course.slug} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-8">
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                        style={{ backgroundColor: category.color }}
                      >
                        {course.title?.charAt(0) || 'C'}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600 mb-1">{course.fees}</p>
                        {course.featured && (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 fill-current" />
                            Popular
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Course Info */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{course.oneLiner}</p>

                    {/* Course Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          Duration
                        </span>
                        <span className="font-medium">{course.duration}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          Level
                        </span>
                        <span className="font-medium">{course.level}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="h-4 w-4" />
                          Certification
                        </span>
                        <span className="font-medium">Included</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/courses/${course.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-red-700 transition-colors group"
                    >
                      View Course Details
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* View All Courses Link */}
            {categoryCourses.length > 0 && (
              <div className="text-center mt-12">
                <Link
                  to={`/courses?category=${categorySlug}`}
                  className="btn-outline inline-flex items-center gap-2"
                >
                  View All {category.name} Courses
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your {category.name} Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of students who have transformed their careers with our industry-focused training programs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admissions" className="btn-primary">
                Apply Now
              </Link>
              <Link to="/contact" className="btn-outline border-gray-400 text-gray-300 hover:bg-gray-800">
                Schedule Free Consultation
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CategoryCoursePage;