import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen,
  Clock,
  Star,
  ArrowRight,
  Award,
  TrendingUp,
  Users
} from 'lucide-react';

// Static Data
import { courses } from '../data/courses';

const MobilePopularCourses = () => {
  // Get top 4 popular courses for mobile
  const popularCourses = courses
    .filter(course => course.visible !== false && course.featured)
    .slice(0, 4);

  const getCourseIcon = (category) => {
    const iconMap = {
      'red-hat-technologies': '🐧',
      'devops-engineering': '🚀', 
      'aws-cloud-platform': '☁️',
      'microsoft-azure': '📚',
      'data-science-ai': '🤖',
      'programming-development': '💻',
      'cyber-security': '🔒'
    };
    return iconMap[category] || '📚';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'red-hat-technologies': 'from-red-500 to-orange-500',
      'devops-engineering': 'from-blue-500 to-cyan-500',
      'aws-cloud-platform': 'from-yellow-500 to-orange-500',
      'microsoft-azure': 'from-blue-600 to-indigo-600',
      'data-science-ai': 'from-purple-500 to-pink-500',
      'programming-development': 'from-green-500 to-emerald-500',
      'cyber-security': 'from-gray-600 to-gray-800'
    };
    return colorMap[category] || 'from-orange-500 to-red-500';
  };

  return (
    <section className="py-8 bg-gradient-to-b from-white to-gray-50 lg:hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-3 shadow-lg">
            <TrendingUp className="h-4 w-4 mr-2" />
            Popular Courses
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Our Popular Courses
          </h2>
          <p className="text-gray-600 text-sm">
            Industry-relevant courses designed to make you job-ready
          </p>
        </div>

        {/* Courses Grid */}
        <div className="space-y-4">
          {popularCourses.map((course, index) => (
            <div
              key={course.slug}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="p-4">
                {/* Course Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {/* Course Icon */}
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getCategoryColor(course.category)} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                      {getCourseIcon(course.category)}
                    </div>
                    
                    {/* Course Basic Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-orange-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {course.oneLiner || course.description?.substring(0, 60) + '...' || 'Comprehensive training program'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Popular Badge */}
                  {index === 0 && (
                    <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </div>
                  )}
                </div>

                {/* Course Details */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {course.duration || '4-6 Weeks'}
                    </div>
                    <div className="flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      {course.level || 'Professional'}
                    </div>
                  </div>
                  
                  {course.fees && (
                    <div className="text-sm font-bold text-orange-600">
                      {course.fees}
                    </div>
                  )}
                </div>

                {/* Course Highlights */}
                {course.highlights && course.highlights.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {course.highlights.slice(0, 2).map((highlight, idx) => (
                        <span
                          key={idx}
                          className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium"
                        >
                          ✓ {highlight}
                        </span>
                      ))}
                      {course.highlights.length > 2 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{course.highlights.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Link
                  to={`/courses/${course.slug}`}
                  className="flex items-center justify-between w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg group"
                >
                  <span>View Details & Enroll</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Courses Button */}
        <div className="text-center mt-6">
          <Link
            to="/courses"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-semibold hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            View All 19 Courses
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MobilePopularCourses;