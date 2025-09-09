import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown,
  ChevronUp,
  BookOpen,
  Users,
  Star,
  ArrowRight
} from 'lucide-react';

// Static Data
import { categories } from '../data/categories';
import { courses } from '../data/courses';

const MobileCourseCategories = () => {
  const [expandedCategories, setExpandedCategories] = useState(new Set(['red-hat-technologies'])); // Default expand Red Hat

  const courseCategories = categories;
  const coursesData = courses;

  // Fallback map (used ONLY if category.logo / logo_url not present)
  const fallbackLogoBySlug = {
    'red-hat-technologies': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg',
    'aws-cloud-platform': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    'devops-engineering': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Devops-toolchain.svg',
    'kubernetes': 'https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg',
    'microsoft-azure': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg',
    'google-cloud-platform': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
    'data-science-ai': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Brain/Color/brain_color.svg',
    'programming-development': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Laptop/Color/laptop_color.svg',
    'cyber-security': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Shield/Color/shield_color.svg',
    'degree-program': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Graduation%20cap/Color/graduation_cap_color.svg'
  };

  // Prefer categories.js logos; fallback to hardcoded if missing
  const getCategoryLogo = (catObj) => {
    return catObj.logo || catObj.logo_url || fallbackLogoBySlug[catObj.slug] || null;
  };

  // Helper: course belongs to slug?
  const courseHasCategory = (course, slug) => {
    if (Array.isArray(course.categories) && course.categories.includes(slug)) return true;
    if (course.category && course.category === slug) return true;
    return false;
  };

  // Get featured categories with counts and top courses
  const featuredCategories = Object.entries(courseCategories)
    .filter(([_, category]) => category.featured)
    .map(([slug, category]) => {
      const inCat = coursesData.filter(course => course.visible !== false && courseHasCategory(course, slug));
      return {
        slug,
        ...category,
        courseCount: inCat.length,
        courses: inCat.slice(0, 3)
      };
    })
    .filter(category => category.courseCount > 0)
    .slice(0, 6);

  const toggleCategory = (categorySlug) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categorySlug)) newExpanded.delete(categorySlug);
    else newExpanded.add(categorySlug);
    setExpandedCategories(newExpanded);
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
            const logoSrc = getCategoryLogo(category);

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
                    {/* Category Logo (bigger for mobile) */}
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center border border-orange-100">
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={`${category.name} logo`}
                          className="max-h-12 w-auto object-contain"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <BookOpen className="h-7 w-7 text-orange-600" />
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
                      {category.courses.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            Featured Courses:
                          </h4>

                          {category.courses.map((course) => (
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
                      )}

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
