import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import axios from 'axios';

const CategoryManager = ({ content, updateContent, saveContent, saving }) => {
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
    const categoryName = 'New Category';
    const categorySlug = `new-category-${timestamp}`;
    
    console.log('➕ Adding new category:', categorySlug);
    
    const newCategory = {
      name: categoryName,
      slug: categorySlug,
      description: 'Enter category description here',
      icon: 'book',  // Changed to 'book' instead of 'folder'
      color: '#3B82F6',
      logo: '', 
      visible: true,
      order: maxOrder + 1,
      featured: true,
      seo: { title: '', description: '', keywords: '' },
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };
    
    const updatedCategories = {
      ...categories,
      [categorySlug]: newCategory
    };
    
    console.log('📝 Updated categories:', Object.keys(updatedCategories));
    
    updateContent('courseCategories', updatedCategories);
    
    // Expand the new category for immediate editing with delay
    setTimeout(() => {
      setExpandedCategory(categorySlug);
      console.log('🔍 Expanded category:', categorySlug);
    }, 100);
    
    // Success feedback
    console.log('✅ New category added successfully');
  };

  // Helper function to generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  };

  const updateCategory = (slug, field, value) => {
    let updatedCategory = { ...categories[slug], [field]: value };
    
    // If name is being updated, also update the slug
    if (field === 'name') {
      const newSlug = generateSlug(value);
      updatedCategory.slug = newSlug;
      
      // If slug is changing, we need to update the category key
      if (newSlug !== slug) {
        const newCategories = { ...categories };
        delete newCategories[slug]; // Remove old key
        newCategories[newSlug] = updatedCategory; // Add with new key
        
        // Also update course references from old slug to new slug
        const updatedCourses = courses.map(course => ({
          ...course,
          categories: (course.categories || []).map(catSlug => 
            catSlug === slug ? newSlug : catSlug
          )
        }));
        
        updateContent('courseCategories', newCategories);
        updateContent('courses', updatedCourses);
        
        // Update expanded category to new slug
        if (expandedCategory === slug) {
          setExpandedCategory(newSlug);
        }
        
        return;
      }
    }
    
    updateContent('courseCategories', {
      ...categories,
      [slug]: updatedCategory
    });
  };

  const deleteCategory = async (slug) => {
    const categoryName = categories[slug]?.name || slug;
    const courseCount = getCoursesByCategory(slug).length;
    
    // Show confirmation dialog
    const confirmMessage = courseCount > 0 
      ? `Are you sure you want to delete "${categoryName}"?\n\nThis will remove the category from ${courseCount} course(s). The courses will remain but will be unassigned from this category.\n\nThis will be saved directly to production database.`
      : `Are you sure you want to delete "${categoryName}"?\n\nThis will be saved directly to production database.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        // Show loading state
        const deleteButton = document.querySelector(`button[onclick*="${slug}"]`);
        if (deleteButton) {
          deleteButton.disabled = true;
          deleteButton.innerHTML = '🔄';
        }
        
        // Make direct API call to delete category
        const token = localStorage.getItem('admin_token');
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://grras-tech-website-production.up.railway.app';
        
        if (!token) {
          throw new Error('No admin token found. Please login again.');
        }
        
        // Fetch current content from backend
        const contentResponse = await fetch(`${BACKEND_URL}/api/content`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!contentResponse.ok) {
          throw new Error(`Failed to fetch content: ${contentResponse.status}`);
        }
        
        const currentContent = await contentResponse.json();
        const backendContent = currentContent.content;
        
        // Delete category from backend content
        const updatedCategories = { ...backendContent.courseCategories };
        delete updatedCategories[slug];
        
        // Remove category from all courses in backend content
        const updatedCourses = (backendContent.courses || []).map(course => ({
          ...course,
          categories: (course.categories || []).filter(cat => cat !== slug)
        }));
        
        // Prepare updated content
        const updatedContent = {
          ...backendContent,
          courseCategories: updatedCategories,
          courses: updatedCourses,
          meta: {
            ...backendContent.meta,
            lastModified: new Date().toISOString(),
            modifiedBy: 'category-delete-direct'
          }
        };
        
        // Save directly to backend
        const saveResponse = await fetch(`${BACKEND_URL}/api/content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: updatedContent,
            isDraft: false
          })
        });
        
        if (!saveResponse.ok) {
          const errorData = await saveResponse.json().catch(() => ({ detail: 'Unknown error' }));
          throw new Error(`Save failed: ${errorData.detail || saveResponse.status}`);
        }
        
        // Update local state to reflect backend changes
        updateContent('courseCategories', updatedCategories);
        updateContent('courses', updatedCourses);
        
        // Success message
        if (courseCount > 0) {
          alert(`✅ SUCCESS!\n\nCategory "${categoryName}" permanently deleted from production database!\n\n${courseCount} course(s) have been unassigned.\n\nChanges are now live on website.`);
        } else {
          alert(`✅ SUCCESS!\n\nCategory "${categoryName}" permanently deleted from production database!\n\nChanges are now live on website.`);
        }
        
        // Force refresh to show updated state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        console.error('Delete category error:', error);
        alert(`❌ FAILED to delete category!\n\nError: ${error.message}\n\nPlease try again or contact support.`);
        
        // Re-enable button
        const deleteButton = document.querySelector(`button[onclick*="${slug}"]`);
        if (deleteButton) {
          deleteButton.disabled = false;
          deleteButton.innerHTML = '🗑️';
        }
      }
    }
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
                  {category.logo && (
                    <img src={category.logo} alt={category.name} className="w-8 h-8 object-contain" />
                  )}
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
                    className="p-2 hover:bg-gray-100 rounded text-blue-600"
                    title={expandedCategory === slug ? "Collapse category" : "Expand to edit category"}
                  >
                    {expandedCategory === slug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  
                  {/* Separated delete button with confirmation */}
                  <div className="ml-4 border-l pl-4">
                    <button
                      onClick={() => {
                        if (confirm(`⚠️ DELETE CATEGORY: "${category.name}"?\n\nThis will:\n• Delete category permanently\n• Remove from all courses\n• Cannot be undone\n\nType "DELETE" to confirm this is intentional.`)) {
                          const confirmation = prompt('Type "DELETE" to confirm:');
                          if (confirmation === 'DELETE') {
                            deleteCategory(slug);
                          } else {
                            alert('❌ Deletion cancelled - confirmation text did not match');
                          }
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
                      title="Delete category (requires confirmation)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {expandedCategory === slug && (
                <div 
                  className="space-y-4 pt-4 border-t"
                  onKeyDown={(e) => {
                    // Prevent keyboard events from bubbling up and closing the editor
                    e.stopPropagation();
                    console.log('🔤 Keyboard event in category editor:', e.key);
                  }}
                  onClick={(e) => {
                    // Prevent clicks inside the form from bubbling up
                    e.stopPropagation();
                  }}
                >
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={category.name || ''}
                        onChange={(e) => updateCategory(slug, 'name', e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onKeyPress={(e) => e.stopPropagation()}
                        className="w-full border rounded p-2"
                        placeholder="Enter category name"
                        autoFocus={slug.includes('new-category')}
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Logo URL</label>
                    <input
                      type="url"
                      value={category.logo || ''}
                      onChange={(e) => updateCategory(slug, 'logo', e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">Company logo for display in dropdowns and cards</p>
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