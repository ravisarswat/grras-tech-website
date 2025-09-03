import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import axios from 'axios';

const CategoryManager = ({ content, updateContent, saveContent, saving }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const formRefs = useRef({});

  // Add global keyboard event handler with Firefox-specific focus detection
  useEffect(() => {
    let focusCheckTimer = null;
    
    const handleGlobalKeyDown = (e) => {
      // Only handle Escape key for closing panels - ignore all other keys completely
      if (e.key !== 'Escape') {
        return;
      }
      
      if (!expandedCategory || !formRefs.current[expandedCategory]) {
        return;
      }
      
      const formElement = formRefs.current[expandedCategory];
      
      // Firefox-compatible focus detection with multiple fallbacks
      const checkFocusAndClose = () => {
        const isInsideForm = (
          // Check the event target first (most reliable)
          (e.target && formElement.contains(e.target)) ||
          // Check active element
          (document.activeElement && formElement.contains(document.activeElement)) ||
          // Check for any focused input/textarea/select inside form
          (formElement.querySelector('input:focus, textarea:focus, select:focus')) ||
          // Check if any form element has focus class or attribute
          (formElement.querySelector('[data-focused="true"]'))
        );
        
        if (!isInsideForm) {
          console.log('✅ Closing panel - no focus detected inside form');
          setExpandedCategory(null);
        } else {
          console.log('🔐 Keeping panel open - focus detected inside form');
        }
      };
      
      // For Firefox compatibility, add small delay to let focus events settle
      if (focusCheckTimer) {
        clearTimeout(focusCheckTimer);
      }
      
      focusCheckTimer = setTimeout(checkFocusAndClose, 0);
    };

    // Use capture phase for more reliable event handling
    document.addEventListener('keydown', handleGlobalKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
      if (focusCheckTimer) {
        clearTimeout(focusCheckTimer);
      }
    };
  }, [expandedCategory]);

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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setExpandedCategory(expandedCategory === slug ? null : slug);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedCategory(expandedCategory === slug ? null : slug);
                      }
                    }}
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
                  ref={(el) => formRefs.current[slug] = el}
                  className="space-y-4 pt-4 border-t bg-blue-50 p-4 rounded-lg"
                  // Prevent only problematic keyboard events from bubbling, allow normal input
                  onKeyDown={(e) => {
                    // Only stop propagation for keys that might trigger unwanted behavior
                    if (e.key === 'Escape' || e.key === 'Enter') {
                      e.stopPropagation();
                      console.log('🚫 Stopped propagation for potentially problematic key:', e.key);
                    }
                    // Let all other keys (typing, paste, etc.) bubble normally
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent any click handlers from collapsing
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation(); // Prevent mousedown from triggering collapse
                  }}
                  style={{ isolation: 'isolate' }}
                >
                  <div className="bg-green-100 border border-green-300 rounded p-2 mb-4">
                    <p className="text-green-800 text-sm font-medium">
                      🔓 <strong>Fixed Form</strong>: This form uses enhanced focus detection for Firefox compatibility. 
                      You can now type, paste, and edit freely. Panel will only close with the collapse button or Escape key when not focused in any input.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={category.name || ''}
                        onChange={(e) => updateCategory(slug, 'name', e.target.value)}
                        onFocus={(e) => {
                          e.target.setAttribute('data-focused', 'true');
                          console.log('🎯 Name field focused');
                        }}
                        onBlur={(e) => {
                          e.target.removeAttribute('data-focused');
                          console.log('👋 Name field blurred');
                        }}
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
                        onFocus={(e) => {
                          e.target.setAttribute('data-focused', 'true');
                          console.log('🎯 Slug field focused');
                        }}
                        onBlur={(e) => {
                          e.target.removeAttribute('data-focused');
                          console.log('👋 Slug field blurred');
                        }}
                        className="w-full border rounded p-2"
                        placeholder="category-url-slug"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Order</label>
                      <input
                        type="number"
                        value={category.order || 1}
                        onChange={(e) => updateCategory(slug, 'order', parseInt(e.target.value))}
                        onFocus={(e) => e.target.setAttribute('data-focused', 'true')}
                        onBlur={(e) => e.target.removeAttribute('data-focused')}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <input
                        type="color"
                        value={category.color || '#3B82F6'}
                        onChange={(e) => updateCategory(slug, 'color', e.target.value)}
                        onFocus={(e) => e.target.setAttribute('data-focused', 'true')}
                        onBlur={(e) => e.target.removeAttribute('data-focused')}
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
                      placeholder="Enter category description"
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
                            onClick={(e) => {
                              e.stopPropagation(); // Only stop this specific event
                              removeCourseFromCategory(slug, course.slug);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      <select
                        onChange={(e) => {
                          e.stopPropagation(); // Only stop this specific event
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

                  {/* Save reminder */}
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mt-4">
                    <p className="text-yellow-800 text-sm">
                      💡 <strong>Remember:</strong> Click "Save Changes" at the top to save your category edits to the database.
                    </p>
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