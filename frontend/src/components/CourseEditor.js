import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus
} from 'lucide-react';

const CourseEditor = ({ 
  course, 
  index, 
  courses,
  categories = {},
  onUpdate, 
  onDelete, 
  onMove 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [slugError, setSlugError] = useState('');

  const validateSlug = (slug) => {
    if (!slug) {
      setSlugError('Slug is required');
      return false;
    }
    
    // Check for valid slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    
    // Check for duplicate slugs (excluding current course)
    const existingCourse = courses.find((c, i) => c.slug === slug && i !== index);
    if (existingCourse) {
      setSlugError('This slug is already in use');
      return false;
    }
    
    setSlugError('');
    return true;
  };

  const handleFieldUpdate = (field, value) => {
    // Special handling for slug validation
    if (field === 'slug') {
      validateSlug(value);
    }
    
    onUpdate(index, { ...course, [field]: value });
  };

  const addHighlight = () => {
    const highlights = course.highlights || [];
    handleFieldUpdate('highlights', [...highlights, '']);
  };

  const updateHighlight = (highlightIndex, value) => {
    const highlights = [...(course.highlights || [])];
    highlights[highlightIndex] = value;
    handleFieldUpdate('highlights', highlights);
  };

  const removeHighlight = (highlightIndex) => {
    const highlights = course.highlights || [];
    const newHighlights = highlights.filter((_, i) => i !== highlightIndex);
    handleFieldUpdate('highlights', newHighlights);
  };

  const sections = [
    { id: 'basic', name: 'Basic Info' },
    { id: 'content', name: 'Content' },
    { id: 'categories', name: 'Categories' },
    { id: 'pricing', name: 'Pricing' },
    { id: 'seo', name: 'SEO' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Course Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* Dynamic Category Display */}
            {course.categories && course.categories.length > 0 ? (
              course.categories.map(categorySlug => {
                const category = categories[categorySlug];
                return category ? (
                  <span key={categorySlug} className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: category.color + '20', color: category.color }}>
                    {category.name}
                  </span>
                ) : (
                  <span key={categorySlug} className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {categorySlug}
                  </span>
                );
              })
            ) : (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                📚 Uncategorized
              </span>
            )}
            
            {course.visible === false && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-600">
                Hidden
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{course.title || 'Untitled Course'}</h3>
            <p className="text-sm text-gray-500">Slug: {course.slug || 'no-slug'}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Move buttons */}
            <button
              onClick={() => onMove(index, 'up')}
              disabled={index === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => onMove(index, 'down')}
              disabled={index === courses.length - 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            
            {/* Visibility toggle */}
            <button
              onClick={() => handleFieldUpdate('visible', !(course.visible === false))}
              className={`p-2 rounded-lg transition-colors ${
                course.visible !== false 
                  ? 'text-green-600 hover:bg-green-50' 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={course.visible !== false ? 'Hide course' : 'Show course'}
            >
              {course.visible !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            
            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {/* Delete button */}
            <button
              onClick={() => onDelete(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete course"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Course Editor (Expanded) */}
      {isExpanded && (
        <div className="p-4">
          {/* Section Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-200">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="space-y-4">
            {activeSection === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={course.title || ''}
                    onChange={(e) => handleFieldUpdate('title', e.target.value)}
                    className="form-input"
                    placeholder="Course title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={course.slug || ''}
                    onChange={(e) => handleFieldUpdate('slug', e.target.value)}
                    className={`form-input ${slugError ? 'border-red-500' : ''}`}
                    placeholder="course-slug"
                  />
                  {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={course.level || ''}
                    onChange={(e) => handleFieldUpdate('level', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={course.duration || ''}
                    onChange={(e) => handleFieldUpdate('duration', e.target.value)}
                    className="form-input"
                    placeholder="e.g., 3 months"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">One-liner</label>
                  <input
                    type="text"
                    value={course.oneLiner || ''}
                    onChange={(e) => handleFieldUpdate('oneLiner', e.target.value)}
                    className="form-input"
                    placeholder="Brief tagline for the course"
                  />
                </div>
              </div>
            )}

            {activeSection === 'content' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={course.description || ''}
                    onChange={(e) => handleFieldUpdate('description', e.target.value)}
                    className="form-input"
                    rows="4"
                    placeholder="Detailed course description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                  <textarea
                    value={course.overview || ''}
                    onChange={(e) => handleFieldUpdate('overview', e.target.value)}
                    className="form-input"
                    rows="3"
                    placeholder="Course overview"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Highlights</label>
                  <div className="space-y-2">
                    {(course.highlights || []).map((highlight, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={highlight}
                          onChange={(e) => updateHighlight(i, e.target.value)}
                          className="form-input flex-1"
                          placeholder="Course highlight"
                        />
                        <button
                          onClick={() => removeHighlight(i)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addHighlight}
                      className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Highlight
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'categories' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  <div className="space-y-2">
                    {Object.entries(categories).map(([slug, category]) => (
                      <label key={slug} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={course.categories?.includes(slug) || false}
                          onChange={(e) => {
                            const currentCategories = course.categories || [];
                            let newCategories;
                            
                            if (e.target.checked) {
                              // Add category if not already present
                              newCategories = currentCategories.includes(slug) 
                                ? currentCategories 
                                : [...currentCategories, slug];
                            } else {
                              // Remove category
                              newCategories = currentCategories.filter(cat => cat !== slug);
                            }
                            
                            handleFieldUpdate('categories', newCategories);
                          }}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-sm">{category.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Select one or more categories for this course. This determines where the course appears on the website.
                  </div>
                  {(!course.categories || course.categories.length === 0) && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ This course is not assigned to any category. It will appear in "Uncategorized" section.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'pricing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="text"
                    value={course.price || ''}
                    onChange={(e) => handleFieldUpdate('price', e.target.value)}
                    className="form-input"
                    placeholder="e.g., ₹35,000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon/Emoji</label>
                  <input
                    type="text"
                    value={course.icon || ''}
                    onChange={(e) => handleFieldUpdate('icon', e.target.value)}
                    className="form-input"
                    placeholder="e.g., 🔴 or 💻"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={course.featured || false}
                      onChange={(e) => handleFieldUpdate('featured', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Course</span>
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'seo' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={course.seo?.title || ''}
                    onChange={(e) => handleFieldUpdate('seo', { ...course.seo, title: e.target.value })}
                    className="form-input"
                    placeholder="Course SEO title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                  <textarea
                    value={course.seo?.description || ''}
                    onChange={(e) => handleFieldUpdate('seo', { ...course.seo, description: e.target.value })}
                    className="form-input"
                    rows="3"
                    placeholder="Course SEO description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
                  <input
                    type="text"
                    value={course.seo?.keywords || ''}
                    onChange={(e) => handleFieldUpdate('seo', { ...course.seo, keywords: e.target.value })}
                    className="form-input"
                    placeholder="course, training, certification, jaipur"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEditor;