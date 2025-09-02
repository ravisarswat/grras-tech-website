import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

const CategoryManager = ({ content, updateContent }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const categories = content?.courseCategories || {};
  const courses = content?.courses || [];

  // Sort categories by order
  const sortedCategories = Object.entries(categories).sort(([, a], [, b]) => {
    return (a.order || 999) - (b.order || 999);
  });

  const addCategory = () => {
    const timestamp = Date.now();
    const maxOrder = Math.max(0, ...Object.values(categories).map(c => c.order || 0));
    
    const newCategory = {
      name: 'New Category',
      slug: `category-${timestamp}`,
      description: 'Category description',
      icon: 'folder',
      color: '#3B82F6',
      visible: true,
      order: maxOrder + 1,
      seo: { title: '', description: '', keywords: '' }
    };
    
    updateContent('courseCategories', {
      ...categories,
      [newCategory.slug]: newCategory
    });
  };

  const updateCategory = (slug, field, value) => {
    updateContent('courseCategories', {
      ...categories,
      [slug]: { ...categories[slug], [field]: value }
    });
  };

  const deleteCategory = (slug) => {
    const newCategories = { ...categories };
    delete newCategories[slug];
    
    // Remove category from all courses
    const updatedCourses = courses.map(course => ({
      ...course,
      categories: (course.categories || []).filter(cat => cat !== slug)
    }));
    
    updateContent('courseCategories', newCategories);
    updateContent('courses', updatedCourses);
  };

  const getCoursesByCategory = (categorySlug) => {
    return courses.filter(course => 
      course.categories && course.categories.includes(categorySlug)
    );
  };

  const assignCourseToCategory = (categorySlug, courseSlug) => {
    const updatedCourses = courses.map(course => {
      if (course.slug === courseSlug) {
        const currentCategories = course.categories || [];
        if (!currentCategories.includes(categorySlug)) {
          return { ...course, categories: [...currentCategories, categorySlug] };
        }
      }
      return course;
    });
    updateContent('courses', updatedCourses);
  };

  const removeCourseFromCategory = (categorySlug, courseSlug) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <button
          onClick={addCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No categories yet</p>
          <button
            onClick={addCategory}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create First Category
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map(([slug, category]) => (
            <div key={slug} className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <span className="text-sm text-gray-500">
                    {getCoursesByCategory(slug).length} courses
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${category.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {category.visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCategory(slug, 'visible', !category.visible)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    {category.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === slug ? null : slug)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    {expandedCategory === slug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => deleteCategory(slug)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedCategory === slug && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(slug, 'name', e.target.value)}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Slug</label>
                      <input
                        type="text"
                        value={category.slug}
                        onChange={(e) => updateCategory(slug, 'slug', e.target.value)}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Order</label>
                      <input
                        type="number"
                        value={category.order || 1}
                        onChange={(e) => updateCategory(slug, 'order', parseInt(e.target.value))}
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={category.description}
                      onChange={(e) => updateCategory(slug, 'description', e.target.value)}
                      className="w-full border rounded p-2"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Assigned Courses ({getCoursesByCategory(slug).length})
                    </label>
                    <div className="space-y-2">
                      {getCoursesByCategory(slug).map(course => (
                        <div key={course.slug} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <span className="font-medium">{course.title}</span>
                          <button
                            onClick={() => removeCourseFromCategory(slug, course.slug)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            assignCourseToCategory(slug, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full border rounded p-2"
                      >
                        <option value="">Add a course...</option>
                        {courses
                          .filter(course => !getCoursesByCategory(slug).some(c => c.slug === course.slug))
                          .map(course => (
                            <option key={course.slug} value={course.slug}>
                              {course.title}
                            </option>
                          ))}
                      </select>
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