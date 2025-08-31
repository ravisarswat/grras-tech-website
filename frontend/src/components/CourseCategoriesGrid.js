import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Cloud, 
  Server, 
  Container, 
  Shield, 
  Code, 
  GraduationCap,
  ArrowRight,
  BookOpen,
  Users
} from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

const CourseCategoriesGrid = () => {
  const { content } = useContent();
  const courseCategories = content?.courseCategories || {};
  const courses = content?.courses || [];

  // Icon mapping for categories
  const iconMap = {
    'cloud': Cloud,
    'server': Server,
    'container': Container,
    'shield': Shield,
    'code': Code,
    'graduation-cap': GraduationCap,
    'folder': BookOpen,
    'book-open': BookOpen,
    'cpu': Server,
    'database': Server,
    'terminal': Code,
    'globe': Server
  };

  // Get featured categories
  const featuredCategories = Object.entries(courseCategories)
    .filter(([_, category]) => category.featured)
    .slice(0, 6);

  if (featuredCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find courses organized by your career interests and build expertise in high-demand technology domains
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredCategories.map(([categorySlug, category]) => {
            const IconComponent = iconMap[category.icon] || BookOpen;
            const categoryCoursesCount = category.courses?.length || 0;
            
            return (
              <Link
                key={categorySlug}
                to={`/courses/category/${categorySlug}`}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Category Icon & Header */}
                <div className="flex items-center mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mr-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: category.color }}
                  >
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {categoryCoursesCount} course{categoryCoursesCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Category Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {category.description}
                </p>

                {/* Course Previews */}
                {category.courses && category.courses.length > 0 && (
                  <div className="mb-6">
                    <div className="space-y-2">
                      {category.courses.slice(0, 3).map((courseSlug) => {
                        const course = courses.find(c => c.slug === courseSlug);
                        return course ? (
                          <div key={courseSlug} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                            <span>{course.title}</span>
                          </div>
                        ) : null;
                      })}
                      {category.courses.length > 3 && (
                        <div className="flex items-center text-sm text-gray-400">
                          <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                          <span>+{category.courses.length - 3} more courses</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* View Category Link */}
                <div className="flex items-center justify-between">
                  <span className="text-red-600 font-medium group-hover:text-red-700">
                    Explore Category
                  </span>
                  <ArrowRight className="h-5 w-5 text-red-600 group-hover:text-red-700 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Categories Link */}
        <div className="text-center">
          <Link
            to="/courses"
            className="btn-outline inline-flex items-center"
          >
            View All Categories
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CourseCategoriesGrid;