import React, { useState, useEffect } from 'react';
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
  Target,
  Folder,
  Cpu,
  Database,
  Terminal,
  Globe
} from 'lucide-react';

const CourseCategoriesGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Icon mapping for categories
  const iconMap = {
    'cloud': Cloud,
    'server': Server,
    'container': Container,
    'shield': Shield,
    'code': Code,
    'graduation-cap': GraduationCap,
    'folder': Folder,
    'book-open': BookOpen,
    'cpu': Cpu,
    'database': Database,
    'terminal': Terminal,
    'globe': Globe
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only show categories with courses
  const visibleCategories = categories.filter(category => 
    category.course_count > 0 && category.featured
  ).slice(0, 6);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading categories...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (visibleCategories.length === 0) {
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
          {visibleCategories.map((category) => {
            const IconComponent = iconMap[category.icon] || BookOpen;
            
            // Create proper course link
            const courseTabLink = `/courses/${category.slug}`;
            
            return (
              <Link
                key={category.slug}
                to={courseTabLink}
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
                      {category.course_count} course{category.course_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Category Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {category.description}
                </p>

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