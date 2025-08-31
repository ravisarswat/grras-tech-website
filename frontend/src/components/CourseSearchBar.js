import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';

const CourseSearchBar = () => {
  const { content } = useContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const searchRef = useRef(null);

  const courses = content?.courses || [];
  const courseCategories = content?.courseCategories || {};

  const quickFilters = ['All', 'Popular', 'Certification', 'Beginner', 'Advanced'];

  // Search and filter logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    let filteredCourses = courses.filter(course => {
      if (!course.visible) return false;

      const matchesSearch = 
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.oneLiner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tools?.some(tool => tool.toLowerCase().includes(searchTerm.toLowerCase())) ||
        course.highlights?.some(highlight => highlight.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Apply filters
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Popular') return course.featured;
      if (selectedFilter === 'Certification') return course.category === 'certification' || course.title?.toLowerCase().includes('certification');
      if (selectedFilter === 'Beginner') return course.level === 'Beginner' || course.level?.includes('Beginner');
      if (selectedFilter === 'Advanced') return course.level === 'Advanced' || course.level?.includes('Advanced');

      return true;
    });

    setResults(filteredCourses.slice(0, 6)); // Limit to 6 results
  }, [searchTerm, selectedFilter, courses]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchFocus = () => {
    setIsExpanded(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setIsExpanded(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleSearchFocus}
            placeholder="Search courses (e.g., RHCSA, AWS, Kubernetes)"
            className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:outline-none transition-colors bg-white shadow-lg"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        {isExpanded && (
          <div className="mt-3 flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isExpanded && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <>
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm text-gray-600">
                  Found {results.length} course{results.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {results.map((course) => (
                  <Link
                    key={course.slug}
                    to={`/courses/${course.slug}`}
                    onClick={() => {
                      clearSearch();
                    }}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {course.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {course.oneLiner}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{course.duration}</span>
                          <span>{course.level}</span>
                          {course.featured && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-red-600">
                          {course.fees}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <Link
                  to="/courses"
                  onClick={() => clearSearch()}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  View all courses →
                </Link>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No courses found</p>
              <p className="text-sm text-gray-400">
                Try searching for "DevOps", "Cloud", "Java", or browse all courses
              </p>
              <Link
                to="/courses"
                onClick={() => clearSearch()}
                className="inline-block mt-4 text-red-600 hover:text-red-700 font-medium"
              >
                Browse All Courses →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseSearchBar;