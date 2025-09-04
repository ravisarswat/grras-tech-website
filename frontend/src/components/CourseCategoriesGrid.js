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
  Users,
  Target
} from 'lucide-react';

// Static Data
import { categories } from '../data/categories';
import { courses } from '../data/courses';

const CourseCategoriesGrid = () => {
  const courseCategories = categories;
  const coursesData = courses;

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
    <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-100/20 to-red-100/20 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-red-100/20 to-orange-100/20 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-6">
            <BookOpen className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-bold text-sm">Course Categories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent">
            Explore by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find courses organized by your career interests and build expertise in high-demand technology domains. 
            <span className="text-orange-600 font-semibold"> Start your journey to success today!</span>
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredCategories.map(([categorySlug, category]) => {
            const IconComponent = iconMap[category.icon] || BookOpen;
            // Calculate course count by checking which courses have this category assigned
            const categoryCoursesCount = coursesData.filter(course => 
              course.categories && course.categories.includes(categorySlug)
            ).length;
            
            // Direct mapping to course tabs using actual database slugs
            const courseTabLink = `/courses?tab=${categorySlug}`;
            
            return (
              <Link
                key={categorySlug}
                to={courseTabLink}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                {/* Background Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-red-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-orange-100/20 to-red-100/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-red-100/20 to-orange-100/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100"></div>
                
                <div className="relative z-10 p-8 h-full flex flex-col">
                  {/* Category Icon & Header */}
                  <div className="flex items-start mb-6">
                    <div className="relative">
                      {/* Icon Background with Glow Effect */}
                      <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                      <div 
                        className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-lg group-hover:scale-110 transition-all duration-300 border-2 border-gray-100"
                        style={{ 
                          boxShadow: `0 8px 32px ${category.color}20`
                        }}
                      >
                        {category.logo_url || category.logo ? (
                          <img 
                            src={category.logo_url || category.logo} 
                            alt={`${category.name} logo`}
                            className="h-10 w-10 object-contain group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              // Fallback to icon if logo fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <IconComponent 
                          className="h-8 w-8 group-hover:scale-110 transition-transform duration-300 text-gray-600" 
                          style={{ display: category.logo_url || category.logo ? 'none' : 'block' }}
                        />
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-red-600 group-hover:bg-clip-text transition-all duration-300 mb-2">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-full">
                          <BookOpen className="h-3 w-3 text-orange-600" />
                          <span className="text-xs font-bold text-orange-800">
                            {categoryCoursesCount} course{categoryCoursesCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                          <Users className="h-3 w-3 text-green-600" />
                          <span className="text-xs font-bold text-green-800">Popular</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm group-hover:text-gray-700 transition-colors duration-300 flex-grow">
                    {category.description}
                  </p>

                  {/* Enhanced Course Previews */}
                  {(() => {
                    const categoryCourses = courses.filter(course => 
                      course.categories && course.categories.includes(categorySlug)
                    );
                    
                    return categoryCourses.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-orange-600" />
                          Featured Courses:
                        </h4>
                        <div className="space-y-2">
                          {categoryCourses.slice(0, 3).map((course, index) => (
                            <div key={course.slug} className="flex items-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                              <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-3 shadow-sm group-hover:scale-125 transition-transform duration-300" style={{ animationDelay: `${index * 100}ms` }}></div>
                              <span className="font-medium truncate">{course.title}</span>
                            </div>
                          ))}
                          {categoryCourses.length > 3 && (
                            <div className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mr-3"></div>
                              <span className="text-gray-500 font-medium">+{categoryCourses.length - 3} more specialized courses</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Enhanced CTA Section */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100 group-hover:from-orange-100 group-hover:to-red-100 group-hover:border-orange-200 transition-all duration-300">
                      <div>
                        <span className="text-orange-700 font-black group-hover:text-orange-800 transition-colors text-sm">
                          Explore Category
                        </span>
                        <p className="text-xs text-orange-600 group-hover:text-orange-700 transition-colors">
                          Start your learning journey
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                          <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-0.5 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
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