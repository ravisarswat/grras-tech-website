import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  ArrowRight, 
  Filter,
  Search,
  Grid,
  List,
  Star,
  TrendingUp,
  CheckCircle,
  X,
  ChevronDown,
  SortAsc,
  SortDesc
} from 'lucide-react';
import SEO from '../components/SEO';
import { useContent } from '../contexts/ContentContext';

const EnhancedCourses = () => {
  const { categorySlug } = useParams();
  const location = useLocation();
  const { content } = useContent();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || 'all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const courses = content?.courses || [];
  const courseCategories = content?.courseCategories || {};

  // Get query parameters for pre-filtering
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const level = params.get('level');
    const category = params.get('category');
    
    if (search) setSearchTerm(search);
    if (level) setSelectedLevel(level);
    if (category) setSelectedCategory(category);
  }, [location.search]);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      if (!course.visible) return false;

      // Search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          course.title?.toLowerCase().includes(searchLower) ||
          course.oneLiner?.toLowerCase().includes(searchLower) ||
          course.tools?.some(tool => tool.toLowerCase().includes(searchLower)) ||
          course.highlights?.some(highlight => highlight.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const categoryData = courseCategories[selectedCategory];
        if (categoryData && categoryData.courses) {
          if (!categoryData.courses.includes(course.slug)) return false;
        } else {
          // Fallback to course category field
          if (course.category !== selectedCategory) return false;
        }
      }

      // Level filter
      if (selectedLevel !== 'all') {
        if (!course.level?.toLowerCase().includes(selectedLevel.toLowerCase())) return false;
      }

      // Duration filter
      if (selectedDuration !== 'all') {
        if (selectedDuration === 'short' && !course.duration?.includes('week')) return false;
        if (selectedDuration === 'medium' && !course.duration?.includes('month')) return false;
        if (selectedDuration === 'long' && !course.duration?.includes('year')) return false;
      }

      return true;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'duration':
          return (a.order || 999) - (b.order || 999);
        case 'level':
          const levelOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          return (levelOrder[a.level] || 999) - (levelOrder[b.level] || 999);
        default:
          return (a.order || 999) - (b.order || 999);
      }
    });

    return filtered;
  }, [courses, courseCategories, searchTerm, selectedCategory, selectedLevel, selectedDuration, sortBy]);

  // Get available categories from CMS
  const availableCategories = useMemo(() => {
    const categories = [{ id: 'all', name: 'All Categories', count: courses.length }];
    
    Object.entries(courseCategories).forEach(([slug, category]) => {
      const categoryCoursesCount = category.courses?.filter(courseSlug => 
        courses.find(c => c.slug === courseSlug && c.visible)
      ).length || 0;
      
      if (categoryCoursesCount > 0) {
        categories.push({
          id: slug,
          name: category.name,
          count: categoryCoursesCount,
          color: category.color,
          icon: category.icon
        });
      }
    });
    
    return categories;
  }, [courses, courseCategories]);

  const levels = ['all', 'beginner', 'intermediate', 'advanced'];
  const durations = [
    { id: 'all', name: 'Any Duration' },
    { id: 'short', name: 'Short (Weeks)' },
    { id: 'medium', name: 'Medium (Months)' },
    { id: 'long', name: 'Long (Years)' }
  ];

  const sortOptions = [
    { id: 'popular', name: 'Most Popular' },
    { id: 'name', name: 'Name (A-Z)' },
    { id: 'level', name: 'Skill Level' },
    { id: 'duration', name: 'Order' }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSelectedDuration('all');
    setSortBy('popular');
  };

  const activeFiltersCount = [
    searchTerm.trim(),
    selectedCategory !== 'all',
    selectedLevel !== 'all', 
    selectedDuration !== 'all'
  ].filter(Boolean).length;

  // Get current category info for page title
  const currentCategory = selectedCategory !== 'all' ? courseCategories[selectedCategory] : null;

  return (
    <>
      <SEO
        title={currentCategory ? 
          `${currentCategory.name} Courses - GRRAS Solutions` : 
          "All IT Courses & Training Programs - GRRAS Solutions"
        }
        description={currentCategory?.description || 
          "Explore comprehensive IT training courses. BCA degree, DevOps, Data Science, Python, Java, Red Hat certifications with placement assistance."
        }
        keywords={currentCategory?.seo?.keywords || 
          "IT courses, computer training, programming courses, certification training"
        }
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="gradient-bg-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {currentCategory ? currentCategory.name : 'All Courses'}
              </h1>
              <p className="text-xl text-gray-100 mb-6 max-w-3xl">
                {currentCategory ? 
                  currentCategory.description : 
                  'Discover comprehensive IT training programs designed to accelerate your career'
                }
              </p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{filteredAndSortedCourses.length} courses available</span>
                </div>
                {currentCategory && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>Industry-focused curriculum</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-6 bg-white border-b sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    showFilters ? 'bg-red-50 border-red-200 text-red-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter Panels */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                  >
                    {availableCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>
                        {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                  >
                    {durations.map(duration => (
                      <option key={duration.id} value={duration.id}>{duration.name}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Courses Grid/List */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredAndSortedCourses.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms to find more courses.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 
                'space-y-6'
              }>
                {filteredAndSortedCourses.map((course) => (
                  <CourseCard 
                    key={course.slug} 
                    course={course} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

// Course Card Component
const CourseCard = ({ course, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {course.title?.charAt(0) || 'C'}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-3">{course.oneLiner}</p>
              </div>
              
              <div className="text-right shrink-0 ml-4">
                <p className="text-2xl font-bold text-red-600 mb-1">{course.fees}</p>
                {course.featured && (
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-current" />
                    Popular
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.level}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>Placement Support</span>
              </div>
            </div>
            
            <Link
              to={`/courses/${course.slug}`}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              View Details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="p-8">
        {/* Course Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
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
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
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
              Support
            </span>
            <span className="font-medium">Placement Assistance</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/courses/${course.slug}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-red-700 transition-colors group/btn"
        >
          View Course Details
          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default EnhancedCourses;