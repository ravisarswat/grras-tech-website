import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cloud, 
  Server, 
  Shield, 
  Code, 
  GraduationCap,
  Container,
  ChevronRight,
  Search
} from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

const CourseCategories = () => {
  const { content } = useContent();
  const [searchTerm, setSearchTerm] = useState('');

  // Category configuration with icons
  const categoryConfig = {
    'cloud-devops': {
      icon: Cloud,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    'linux-redhat': {
      icon: Server,
      color: 'bg-red-500', 
      gradient: 'from-red-500 to-red-600'
    },
    'kubernetes': {
      icon: Container,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    'cybersecurity': {
      icon: Shield,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    'programming': {
      icon: Code,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    'degree': {
      icon: GraduationCap,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600'
    }
  };

  const categories = content?.courseCategories || {};
  const allCourses = content?.courses || [];

  // Filter courses based on search
  const filteredCourses = allCourses.filter(course => 
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.overview?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose from industry-leading certifications and career-focused programs
          </p>

          {/* Quick Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search courses (e.g., RHCSA, AWS, Kubernetes)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Search Results ({filteredCourses.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.slice(0, 6).map((course, index) => (
                <Link
                  key={course.slug}
                  to={`/courses/${course.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {course.overview}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-red-600 font-medium">
                      {course.duration}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
            {filteredCourses.length > 6 && (
              <div className="text-center mt-6">
                <Link to="/courses" className="btn-outline">
                  View All {filteredCourses.length} Results
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Course Categories Grid */}
        {!searchTerm && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(categories).map(([categoryKey, category]) => {
              const config = categoryConfig[categoryKey] || categoryConfig['programming'];
              const IconComponent = config.icon;
              const categorycourses = allCourses.filter(course => 
                category.courses?.includes(course.slug)
              );

              return (
                <Link
                  key={categoryKey}
                  to={`/courses/category/${categoryKey}`}
                  className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative p-8">
                    {/* Icon */}
                    <div className={`w-16 h-16 ${config.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                      {category.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {category.description}
                    </p>

                    {/* Course Count */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {categoryCourses.length} Course{categoryCourses.length !== 1 ? 's' : ''}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Popular Courses Preview */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="space-y-1">
                        {categoryCourses.slice(0, 3).map((course) => (
                          <div key={course.slug} className="text-xs text-gray-500">
                            • {course.title}
                          </div>
                        ))}
                        {categoryCourses.length > 3 && (
                          <div className="text-xs text-red-600 font-medium">
                            +{categoryCourses.length - 3} more courses
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All Courses CTA */}
        {!searchTerm && (
          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="btn-primary inline-flex items-center text-lg px-8 py-4"
            >
              Browse All Courses
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCategories;