import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, X } from 'lucide-react';

const CategoryManager = ({ content, updateContent }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: 'folder',
    color: '#3B82F6',
    logo: '',
    visible: true,
    order: 1,
    seo: { title: '', description: '', keywords: '' }
  });

  const categories = content?.courseCategories || {};
  const courses = content?.courses || [];

  // Simple slug generator
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Reset new category form
  const resetForm = () => {
    const maxOrder = Math.max(0, ...Object.values(categories).map(c => c.order || 0));
    setNewCategory({
      name: '',
      description: '',
      icon: 'folder',
      color: '#3B82F6',
      logo: '',
      visible: true,
      order: maxOrder + 1,
      seo: { title: '', description: '', keywords: '' }
    });
  };

  // Add Category with full form
  const addCategory = () => {
    if (!newCategory.name.trim()) {
      alert('Category name is required!');
      return;
    }

    const slug = generateSlug(newCategory.name);
    if (categories[slug]) {
      alert('Category with this name already exists!');
      return;
    }

    const categoryData = {
      ...newCategory,
      slug: slug,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    console.log('➕ Adding category:', slug, categoryData);

    updateContent('courseCategories', {
      ...categories,
      [slug]: categoryData
    });

    setShowAddForm(false);
    resetForm();
    alert(`✅ Category "${newCategory.name}" added successfully!`);
  };

  // Update Category (No automatic slug sync)
  const updateCategory = (slug, field, value) => {
    const updated = { ...categories[slug] };
    
    if (field.includes('.')) {
      // Handle nested fields like seo.title
      const [parent, child] = field.split('.');
      updated[parent] = { ...updated[parent], [child]: value };
    } else {
      updated[field] = value;
    }
    
    updated.modifiedAt = new Date().toISOString();

    console.log('📝 Updating category:', slug, field, value);

    // Simple update - no automatic slug sync
    updateContent('courseCategories', {
      ...categories,
      [slug]: updated
    });
  };

  // Test function
  const testDelete = (slug) => {
    alert('Test delete called for: ' + slug);
  };

  // Delete Category - Direct State Update Approach
  const deleteCategory = (slug) => {
    console.log('🗑️ DELETE ATTEMPT:', slug);
    
    const categoryName = categories[slug]?.name;
    if (!categoryName) {
      alert('Category not found!');
      return;
    }
    
    if (!confirm(`Delete "${categoryName}"?`)) {
      return;
    }

    console.log('✅ User confirmed deletion for:', categoryName);

    try {
      // Step 1: Create new categories without deleted one
      const newCategories = {};
      Object.keys(categories).forEach(key => {
        if (key !== slug) {
          newCategories[key] = categories[key];
        }
      });
      
      console.log('🗑️ Categories before delete:', Object.keys(categories));
      console.log('🗑️ Categories after delete:', Object.keys(newCategories));
      
      // Step 2: Update courses to remove category reference
      const newCourses = courses.map(course => ({
        ...course,
        categories: (course.categories || []).filter(cat => cat !== slug)
      }));
      
      // Step 3: Create completely new content object
      const newContent = {
        ...content,
        courseCategories: newCategories,
        courses: newCourses,
        _lastModified: new Date().toISOString()
      };
      
      console.log('🗑️ Calling updateContent with new content structure');
      
      // Step 4: Update both at once with new content
      updateContent('courseCategories', newCategories);
      
      // Wait a moment, then update courses
      setTimeout(() => {
        updateContent('courses', newCourses);
      }, 100);
      
      // Force local state refresh
      setExpandedCategory(null);

      console.log('✅ Category delete operation completed');
      alert(`✅ Category "${categoryName}" deleted successfully!`);
      
    } catch (error) {
      console.error('❌ Error during category deletion:', error);
      alert('Error deleting category: ' + error.message);
    }
  };

  // Sync All Category Slugs
  const syncAllCategorySlugs = () => {
    if (!confirm('Sync all category slugs based on current names? This will update URLs and may affect existing links.')) {
      return;
    }

    const updatedCategories = {};
    const slugMappings = {}; // old slug -> new slug
    let hasChanges = false;

    // First pass: create new categories with updated slugs
    Object.entries(categories).forEach(([oldSlug, category]) => {
      const newSlug = generateSlug(category.name);
      
      if (newSlug !== oldSlug) {
        hasChanges = true;
        slugMappings[oldSlug] = newSlug;
        console.log(`🔄 Slug sync: "${oldSlug}" -> "${newSlug}"`);
      }
      
      updatedCategories[newSlug] = {
        ...category,
        slug: newSlug,
        modifiedAt: new Date().toISOString()
      };
    });

    if (!hasChanges) {
      alert('✅ All category slugs are already synced!');
      return;
    }

    // Second pass: update all courses that reference old slugs
    const updatedCourses = courses.map(course => {
      let courseUpdated = false;
      const newCategories = (course.categories || []).map(catSlug => {
        if (slugMappings[catSlug]) {
          courseUpdated = true;
          return slugMappings[catSlug];
        }
        return catSlug;
      });

      const newCategory = course.category && slugMappings[course.category] 
        ? slugMappings[course.category] 
        : course.category;

      if (courseUpdated || newCategory !== course.category) {
        return {
          ...course,
          categories: newCategories,
          category: newCategory,
          modifiedAt: new Date().toISOString()
        };
      }
      return course;
    });

    // Update both categories and courses
    updateContent('courseCategories', updatedCategories);
    updateContent('courses', updatedCourses);

    const changesCount = Object.keys(slugMappings).length;
    alert(`✅ Synced ${changesCount} category slugs!\n\n${Object.entries(slugMappings).map(([old, new_]) => `"${old}" → "${new_}"`).join('\n')}`);
  };

  // Get courses by category
  const getCoursesByCategory = (slug) => {
    return courses.filter(course => 
      course.categories && course.categories.includes(slug)
    );
  };

  // Assign course to category
  const assignCourse = (categorySlug, courseSlug) => {
    const updatedCourses = courses.map(course => {
      if (course.slug === courseSlug) {
        const cats = course.categories || [];
        if (!cats.includes(categorySlug)) {
          return { ...course, categories: [...cats, categorySlug] };
        }
      }
      return course;
    });
    updateContent('courses', updatedCourses);
  };

  // Remove course from category
  const removeCourse = (categorySlug, courseSlug) => {
    const updatedCourses = courses.map(course => {
      if (course.slug === courseSlug) {
        return {
          ...course,
          categories: (course.categories || []).filter(cat => cat !== categorySlug)
        };
      }
      return course;
    });
    updateContent('courses', updatedCourses);
  };

  const sortedCategories = Object.entries(categories).sort(([,a], [,b]) => 
    (a.order || 0) - (b.order || 0)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={syncAllCategorySlugs}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 text-sm"
            title="Sync all category slugs with current names"
          >
            🔄 Sync All Slugs
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Add Category Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Category</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="w-full border rounded p-2"
                    placeholder="e.g. Server Administration & Networking"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Icon</label>
                  <input
                    type="text"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                    className="w-full border rounded p-2"
                    placeholder="e.g. folder, server, network"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full border rounded p-2"
                  rows="3"
                  placeholder="e.g. Learn core server administration, system management, and networking concepts..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={newCategory.order}
                    onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value) || 1})}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                    className="w-full border rounded p-2 h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Visible</label>
                  <select
                    value={newCategory.visible}
                    onChange={(e) => setNewCategory({...newCategory, visible: e.target.value === 'true'})}
                    className="w-full border rounded p-2"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Logo URL</label>
                <input
                  type="url"
                  value={newCategory.logo}
                  onChange={(e) => setNewCategory({...newCategory, logo: e.target.value})}
                  className="w-full border rounded p-2"
                  placeholder="e.g. https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">SEO Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={newCategory.seo.title}
                      onChange={(e) => setNewCategory({
                        ...newCategory, 
                        seo: {...newCategory.seo, title: e.target.value}
                      })}
                      className="w-full border rounded p-2 text-sm"
                      placeholder="SEO title for search engines"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">SEO Description</label>
                    <textarea
                      value={newCategory.seo.description}
                      onChange={(e) => setNewCategory({
                        ...newCategory, 
                        seo: {...newCategory.seo, description: e.target.value}
                      })}
                      className="w-full border rounded p-2 text-sm"
                      rows="2"
                      placeholder="SEO description for search engines"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">SEO Keywords</label>
                    <input
                      type="text"
                      value={newCategory.seo.keywords}
                      onChange={(e) => setNewCategory({
                        ...newCategory, 
                        seo: {...newCategory.seo, keywords: e.target.value}
                      })}
                      className="w-full border rounded p-2 text-sm"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {sortedCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No categories yet</p>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
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
                  {category.logo && (
                    <img src={category.logo} alt={category.name} className="w-8 h-8 object-contain" />
                  )}
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <span className="text-sm text-gray-500">
                    ({getCoursesByCategory(slug).length} courses)
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    category.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
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
                    className="p-2 hover:bg-gray-100 rounded text-blue-600"
                  >
                    {expandedCategory === slug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  
                  <button
                    onClick={() => deleteCategory(slug)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-200 ml-4"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedCategory === slug && (
                <div className="space-y-4 pt-4 border-t bg-gray-50 p-4 rounded-lg">
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
                      <label className="block text-sm font-medium mb-2">Order</label>
                      <input
                        type="number"
                        value={category.order || 1}
                        onChange={(e) => updateCategory(slug, 'order', parseInt(e.target.value))}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <input
                        type="color"
                        value={category.color || '#3B82F6'}
                        onChange={(e) => updateCategory(slug, 'color', e.target.value)}
                        className="w-full border rounded p-2 h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={category.description || ''}
                        onChange={(e) => updateCategory(slug, 'description', e.target.value)}
                        className="w-full border rounded p-2"
                        rows="2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Logo URL</label>
                      <input
                        type="url"
                        value={category.logo || ''}
                        onChange={(e) => updateCategory(slug, 'logo', e.target.value)}
                        className="w-full border rounded p-2"
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-xs text-gray-500 mt-1">Logo for category display</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Icon</label>
                      <input
                        type="text"
                        value={category.icon || ''}
                        onChange={(e) => updateCategory(slug, 'icon', e.target.value)}
                        className="w-full border rounded p-2"
                        placeholder="e.g. folder, server, network"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Visible</label>
                      <select
                        value={category.visible ? 'true' : 'false'}
                        onChange={(e) => updateCategory(slug, 'visible', e.target.value === 'true')}
                        className="w-full border rounded p-2"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Courses ({getCoursesByCategory(slug).length})
                    </label>
                    
                    {getCoursesByCategory(slug).map(course => (
                      <div key={course.slug} className="flex items-center justify-between bg-white p-3 rounded mb-2">
                        <span>{course.title}</span>
                        <button
                          onClick={() => removeCourse(slug, course.slug)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          assignCourse(slug, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full border rounded p-2 mt-2"
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;