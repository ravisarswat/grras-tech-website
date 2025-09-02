import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown,
  Save,
  X,
  AlertCircle,
  Move
} from 'lucide-react';

const CategoryManager = ({ categories, courses, updateContent }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'folder',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-blue-600',
    featured: true,
    order: Object.keys(categories).length + 1,
    logo_url: '',
    seo: {
      title: '',
      description: '',
      keywords: ''
    }
  });
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Available colors for categories
  const colorOptions = [
    { name: 'Red', value: '#EE0000', gradient: 'from-red-600 to-red-700' },
    { name: 'Orange', value: '#FF9900', gradient: 'from-orange-500 to-yellow-500' },
    { name: 'Blue', value: '#326CE5', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Green', value: '#10B981', gradient: 'from-green-500 to-green-600' },
    { name: 'Purple', value: '#8B5CF6', gradient: 'from-purple-500 to-purple-600' },
    { name: 'Indigo', value: '#6366F1', gradient: 'from-indigo-500 to-indigo-600' },
    { name: 'Amber', value: '#F59E0B', gradient: 'from-amber-500 to-amber-600' },
    { name: 'Slate', value: '#64748B', gradient: 'from-slate-500 to-slate-600' }
  ];

  // Available icons
  const iconOptions = [
    'server', 'cloud', 'container', 'shield', 'code', 'graduation-cap', 
    'folder', 'database', 'terminal', 'globe', 'cpu', 'book-open'
  ];

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCreateCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        alert('Category name is required');
        return;
      }

      const slug = generateSlug(newCategory.name);
      
      // Check if slug already exists
      if (categories[slug]) {
        alert('A category with this name already exists');
        return;
      }

      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newCategory,
          slug: slug,
          seo_title: newCategory.seo.title || `${newCategory.name} Training - GRRAS Jaipur`,
          seo_description: newCategory.seo.description || newCategory.description,
          seo_keywords: newCategory.seo.keywords || `${newCategory.name.toLowerCase()}, training, courses, jaipur`
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update local state
        const updatedCategories = {
          ...categories,
          [slug]: {
            ...newCategory,
            slug: slug,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        };
        updateContent('courseCategories', updatedCategories);
        
        // Reset form
        setNewCategory({
          name: '',
          slug: '',
          description: '',
          icon: 'folder',
          color: '#3B82F6',
          gradient: 'from-blue-500 to-blue-600',
          featured: true,
          order: Object.keys(categories).length + 2,
          logo_url: '',
          seo: { title: '', description: '', keywords: '' }
        });
        setShowNewCategoryForm(false);
        
        alert('Category created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create category: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category. Please try again.');
    }
  };

  const deleteCategory = async (categorySlug) => {
    const category = categories[categorySlug];
    const categoryName = category?.name || categorySlug;
    
    // Count courses in this category
    const coursesInCategory = courses.filter(course => 
      course.categories && course.categories.includes(categorySlug)
    );
    
    let confirmMessage = `Are you sure you want to delete the category "${categoryName}"?`;
    if (coursesInCategory.length > 0) {
      confirmMessage += `\n\n${coursesInCategory.length} course(s) will be automatically unassigned from this category:\n`;
      confirmMessage += coursesInCategory.map(c => `• ${c.title}`).join('\n');
    }
    confirmMessage += '\n\nThis action cannot be undone.';
    
    if (window.confirm(confirmMessage)) {
      try {
        // Call backend API to delete category with proper course handling
        const token = localStorage.getItem('admin_token');
        
        const response = await fetch(`${BACKEND_URL}/api/admin/categories/${categorySlug}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Update local state
          const newCategories = { ...categories };
          delete newCategories[categorySlug];
          updateContent('courseCategories', newCategories);
          
          // Update courses to remove this category
          const updatedCourses = courses.map(course => {
            if (course.categories && course.categories.includes(categorySlug)) {
              return {
                ...course,
                categories: course.categories.filter(cat => cat !== categorySlug)
              };
            }
            return course;
          });
          updateContent('courses', updatedCourses);
          
          // Show success message with details
          alert(result.message);
        } else {
          const error = await response.json();
          alert(`Failed to delete category: ${error.detail}`);
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. Please try again.');
      }
    }
  };

  const toggleCategoryVisibility = (categorySlug) => {
    const updatedCategories = {
      ...categories,
      [categorySlug]: {
        ...categories[categorySlug],
        featured: !categories[categorySlug].featured
      }
    };
    updateContent('courseCategories', updatedCategories);
  };

  const updateCategoryOrder = (categorySlug, direction) => {
    const currentOrder = categories[categorySlug].order || 1;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    // Find category with the target order and swap
    const targetCategory = Object.entries(categories).find(([slug, cat]) => cat.order === newOrder);
    
    if (targetCategory) {
      const updatedCategories = { ...categories };
      updatedCategories[categorySlug].order = newOrder;
      updatedCategories[targetCategory[0]].order = currentOrder;
      updateContent('courseCategories', updatedCategories);
    }
  };

  // Sort categories by order
  const sortedCategories = Object.entries(categories).sort(([, a], [, b]) => (a.order || 999) - (b.order || 999));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Course Categories Management</h3>
        <button
          onClick={() => setShowNewCategoryForm(true)}
          className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* New Category Form */}
      {showNewCategoryForm && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Create New Category</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                className="form-input"
                placeholder="e.g., Machine Learning"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <select
                value={newCategory.icon}
                onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                className="form-input"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                className="form-input"
                rows="3"
                placeholder="Brief description of this category..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Optional)</label>
              <input
                type="url"
                value={newCategory.logo_url}
                onChange={(e) => setNewCategory({...newCategory, logo_url: e.target.value})}
                className="form-input"
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={newCategory.color}
                onChange={(e) => {
                  const selectedColor = colorOptions.find(c => c.value === e.target.value);
                  setNewCategory({
                    ...newCategory, 
                    color: e.target.value,
                    gradient: selectedColor?.gradient || 'from-blue-500 to-blue-600'
                  });
                }}
                className="form-input"
              >
                {colorOptions.map(color => (
                  <option key={color.value} value={color.value}>{color.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                value={newCategory.order}
                onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value) || 1})}
                className="form-input"
                min="1"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCategory.featured}
                  onChange={(e) => setNewCategory({...newCategory, featured: e.target.checked})}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured (Show on homepage)</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleCreateCategory}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Create Category
            </button>
            <button
              onClick={() => setShowNewCategoryForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {sortedCategories.map(([categorySlug, category]) => (
          <div key={categorySlug} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: category.color }}
                >
                  {category.order || '?'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    {category.featured ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        <Eye className="h-3 w-3" />
                        Visible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <EyeOff className="h-3 w-3" />
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {courses.filter(c => c.categories && c.categories.includes(categorySlug)).length} courses • {category.featured ? 'Featured' : 'Regular'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Reorder buttons */}
                <button
                  onClick={() => updateCategoryOrder(categorySlug, 'up')}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => updateCategoryOrder(categorySlug, 'down')}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {/* Visibility toggle */}
                <button
                  onClick={() => toggleCategoryVisibility(categorySlug)}
                  className={`p-2 rounded-lg transition-colors ${
                    category.featured 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={category.featured ? 'Hide category' : 'Show category'}
                >
                  {category.featured ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                
                {/* Delete button */}
                <button
                  onClick={() => deleteCategory(categorySlug)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {sortedCategories.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-4">Create your first category to get started.</p>
          <button
            onClick={() => setShowNewCategoryForm(true)}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Category
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;