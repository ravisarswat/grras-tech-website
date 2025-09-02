import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Save, ChevronUp, ChevronDown, Tag, Palette, Globe } from 'lucide-react';

const CategoryManager = ({ content, updateContent }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const categories = content?.courseCategories || {};
  const courses = content?.courses || [];

  // Debug: Log categories to console
  console.log('CategoryManager - Categories:', categories);
  console.log('CategoryManager - Categories count:', Object.keys(categories).length);
  console.log('CategoryManager - Content:', content);

  const addCategory = () => {
    const timestamp = Date.now();
    const newCategory = {
      name: 'New Category',
      slug: `new-category-${timestamp}`,
      description: 'Category description',
      icon: 'folder',
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-600',
      featured: false,
      courses: [],
      seo: {
        title: '',
        description: '',
        keywords: ''
      }
    };
    
    const newCategories = {
      ...categories,
      [newCategory.slug]: newCategory
    };
    
    updateContent('courseCategories', newCategories);
  };

  const updateCategory = (categorySlug, field, value) => {
    const newCategories = { ...categories };
    
    if (field === 'slug' && value !== categorySlug) {
      // Handle slug change by creating new entry and deleting old
      newCategories[value] = { ...newCategories[categorySlug], slug: value };
      delete newCategories[categorySlug];
    } else {
      newCategories[categorySlug] = { ...newCategories[categorySlug], [field]: value };
    }
    
    updateContent('courseCategories', newCategories);
  };

  const updateCategorySEO = (categorySlug, field, value) => {
    const newCategories = { ...categories };
    newCategories[categorySlug] = {
      ...newCategories[categorySlug],
      seo: {
        ...newCategories[categorySlug].seo,
        [field]: value
      }
    };
    updateContent('courseCategories', newCategories);
  };

  const deleteCategory = (categorySlug) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      const newCategories = { ...categories };
      delete newCategories[categorySlug];
      updateContent('courseCategories', newCategories);
    }
  };

  const toggleCategoryFeatured = (categorySlug) => {
    const category = categories[categorySlug];
    updateCategory(categorySlug, 'featured', !category.featured);
  };

  // Get courses assigned to a category
  const getCoursesByCategory = (categorySlug) => {
    return courses.filter(course => 
      course.categories && course.categories.includes(categorySlug)
    );
  };

  const addCourseToCategory = (categorySlug, courseSlug) => {
    // Find the course and add category to its categories array
    const updatedCourses = courses.map(course => {
      if (course.slug === courseSlug) {
        const currentCategories = course.categories || [];
        if (!currentCategories.includes(categorySlug)) {
          return {
            ...course,
            categories: [...currentCategories, categorySlug]
          };
        }
      }
      return course;
    });
    
    updateContent('courses', updatedCourses);
  };

  const removeCourseFromCategory = (categorySlug, courseSlug) => {
    // Find the course and remove category from its categories array
    const updatedCourses = courses.map(course => {
      if (course.slug === courseSlug && course.categories) {
        return {
          ...course,
          categories: course.categories.filter(cat => cat !== categorySlug)
        };
      }
      return course;
    });
    
    updateContent('courses', updatedCourses);
  };

  // Safe check for available courses to prevent undefined errors
  const availableCourses = courses.filter(course => 
    course && course.visible !== false && course.slug && course.title
  );

  const iconOptions = [
    'folder', 'code', 'server', 'shield', 'cloud', 'container', 
    'graduation-cap', 'book-open', 'cpu', 'database', 'terminal', 'globe'
  ];

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Red', value: '#EF4444', gradient: 'from-red-500 to-red-600' },
    { name: 'Green', value: '#10B981', gradient: 'from-green-500 to-green-600' },
    { name: 'Purple', value: '#8B5CF6', gradient: 'from-purple-500 to-purple-600' },
    { name: 'Orange', value: '#F59E0B', gradient: 'from-orange-500 to-orange-600' },
    { name: 'Indigo', value: '#6366F1', gradient: 'from-indigo-500 to-indigo-600' },
    { name: 'Pink', value: '#EC4899', gradient: 'from-pink-500 to-pink-600' },
    { name: 'Teal', value: '#14B8A6', gradient: 'from-teal-500 to-teal-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Course Categories</h2>
          <p className="text-sm text-gray-600 mt-1">
            Organize courses into categories for better discovery and navigation
          </p>
        </div>
        <button
          onClick={addCategory}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Tag className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-blue-900 font-medium">Category Management</h4>
            <p className="text-blue-800 text-sm mt-1">
              Categories help organize courses and improve user experience. Featured categories 
              will be prominently displayed on the homepage and course discovery sections.
            </p>
          </div>
        </div>
      </div>

      {Object.keys(categories).length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first course category to start organizing your courses.
          </p>
          <button
            onClick={addCategory}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Create First Category
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(categories).map(([categorySlug, category]) => (
            <div key={categorySlug} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Category Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {getCoursesByCategory(categorySlug).length} courses • {category.featured ? 'Featured' : 'Regular'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCategoryFeatured(categorySlug)}
                      className={`p-2 rounded-lg ${
                        category.featured 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title={category.featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      {category.featured ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => setExpandedCategory(
                        expandedCategory === categorySlug ? null : categorySlug
                      )}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      {expandedCategory === categorySlug ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </button>
                    
                    <button
                      onClick={() => deleteCategory(categorySlug)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Details (Expandable) */}
              {expandedCategory === categorySlug && (
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name
                      </label>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(categorySlug, 'name', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Cloud & DevOps"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={category.slug}
                        onChange={(e) => updateCategory(categorySlug, 'slug', e.target.value)}
                        className="form-input"
                        placeholder="e.g., cloud-devops"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={category.description}
                      onChange={(e) => updateCategory(categorySlug, 'description', e.target.value)}
                      className="form-textarea"
                      rows={3}
                      placeholder="Describe what this category covers..."
                    />
                  </div>

                  {/* Visual Settings */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <select
                        value={category.icon}
                        onChange={(e) => updateCategory(categorySlug, 'icon', e.target.value)}
                        className="form-input"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Theme
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {colorOptions.map(color => (
                          <button
                            key={color.value}
                            onClick={() => {
                              updateCategory(categorySlug, 'color', color.value);
                              updateCategory(categorySlug, 'gradient', color.gradient);
                            }}
                            className={`w-8 h-8 rounded-lg ${
                              category.color === color.value ? 'ring-2 ring-gray-400' : ''
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Course Assignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Courses ({getCoursesByCategory(categorySlug).length})
                    </label>
                    
                    <div className="space-y-2">
                      {/* Current courses */}
                      {getCoursesByCategory(categorySlug).map(course => (
                        <div key={course.slug} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium">{course.title}</span>
                          <button
                            onClick={() => removeCourseFromCategory(categorySlug, course.slug)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Add course dropdown */}
                      <div className="flex gap-2">
                        <select
                          className="form-input flex-1"
                          onChange={(e) => {
                            if (e.target.value) {
                              addCourseToCategory(categorySlug, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">Select course to add...</option>
                          {availableCourses
                            .filter(course => !getCoursesByCategory(categorySlug).some(c => c.slug === course.slug))
                            .map(course => (
                              <option key={course.slug} value={course.slug}>
                                {course.title}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SEO Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      SEO Settings
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={category.seo?.title || ''}
                          onChange={(e) => updateCategorySEO(categorySlug, 'title', e.target.value)}
                          className="form-input"
                          placeholder="SEO title for this category page"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          value={category.seo?.description || ''}
                          onChange={(e) => updateCategorySEO(categorySlug, 'description', e.target.value)}
                          className="form-textarea"
                          rows={2}
                          placeholder="Brief description for search engines"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Keywords
                        </label>
                        <input
                          type="text"
                          value={category.seo?.keywords || ''}
                          onChange={(e) => updateCategorySEO(categorySlug, 'keywords', e.target.value)}
                          className="form-input"
                          placeholder="Comma-separated keywords"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;