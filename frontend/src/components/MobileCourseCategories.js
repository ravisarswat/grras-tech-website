import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown,
  ChevronUp,
  BookOpen,
  Users,
  Star,
  ArrowRight,
  Award,
  TrendingUp
} from 'lucide-react';

// Static Data
import { categories } from '../data/categories';
import { courses } from '../data/courses';

const MobileCourseCategories = () => {
  const [expandedCategories, setExpandedCategories] = useState(new Set(['red-hat-technologies'])); // Default expand Red Hat

  const courseCategories = categories;
  const coursesData = courses;

  // Get featured categories with course counts
  const featuredCategories = Object.entries(courseCategories)
    .filter(([_, category]) => category.featured)
    .map(([slug, category]) => {
      const categoryCoursesCount = coursesData.filter(course => 
        course.category === slug && course.visible !== false
      ).length;
      
      return {
        slug,
        ...category,
        courseCount: categoryCoursesCount,
        courses: coursesData.filter(course => 
          course.category === slug && course.visible !== false
        ).slice(0, 3) // Show only first 3 courses
      };
    })
    .filter(category => category.courseCount > 0)
    .slice(0, 6);

  const toggleCategory = (categorySlug) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categorySlug)) {
      newExpanded.delete(categorySlug);
    } else {
      newExpanded.add(categorySlug);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = (category) => {
    // Based on category name, return appropriate icon/image
    if (category.slug === 'red-hat-technologies') {
      return 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg';
    } else if (category.slug === 'aws-cloud-platform') {
      return 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg';
    } else if (category.slug === 'devops-engineering') {
      return 'https://upload.wikimedia.org/wikipedia/commons/0/05/Devops-toolchain.svg';
    } else if (category.slug === 'microsoft-azure') {
      return 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg';
    } else if (category.slug === 'google-cloud-platform') {
      return 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg';
    } else if (category.slug === 'data-science-ai') {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Scikit_learn_logo_small.svg/1200px-Scikit_learn_logo_small.svg.png';
    }
    return null;
  };

  return (
    <section className="py-8 bg-gradient-to-b from-white to-orange-50/30 lg:hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <BookOpen className="h-4 w-4 mr-2" />
            Course Categories
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Explore by Category
          </h2>
          <p className="text-gray-600 text-sm">
            Find courses organized by your career interests
          </p>
        </div>

        {/* Mobile Categories */}
        <div className="space-y-3">
          {featuredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.slug);
            const categoryIcon = getCategoryIcon(category);
            
            return (
              <div 
                key={category.slug}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.slug)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    {/* Category Icon */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center border border-orange-100">
                      {categoryIcon ? (
                        <img 
                          src={categoryIcon} 
                          alt={category.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <BookOpen className="h-6 w-6 text-orange-600" />
                      )}
                    </div>
                    
                    {/* Category Info */}
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-gray-900 text-sm">
                        {category.name}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {category.courseCount} courses
                        </span>
                        {category.courseCount >= 3 && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Icon */}
                  <div className="ml-2">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    <div className="p-4 space-y-3">
                      {/* Category Description */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {category.description}
                      </p>
                      
                      {/* Featured Courses */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          Featured Courses:
                        </h4>
                        
                        {category.courses.map((course, index) => (
                          <Link
                            key={course.slug}
                            to={`/courses/${course.slug}`}
                            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-200 hover:shadow-sm transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 text-sm group-hover:text-orange-600 transition-colors">
                                  {course.title}
                                </h5>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {course.duration || '4-6 Weeks'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {course.level || 'Professional'}
                                  </span>
                                  {course.fees && (
                                    <span className="text-xs font-medium text-orange-600">
                                      {course.fees}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                            </div>
                          </Link>
                        ))}
                      </div>
                      
                      {/* View All Button */}
                      <Link
                        to={`/courses?tab=${category.slug}`}
                        className="block w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        View All {category.courseCount} Courses
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-8">
          <Link
            to="/courses"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-semibold hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            View All Categories
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MobileCourseCategories;