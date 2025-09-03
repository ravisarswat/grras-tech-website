import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronRight,
  GripVertical,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useContent } from '../contexts/ContentContext';

const CourseEditor = ({ 
  course, 
  index, 
  courses,
  onUpdate, 
  onDelete, 
  onMove 
}) => {
  const { content } = useContent();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [slugError, setSlugError] = useState('');
  
  // Auto-sync category to categories array for backward compatibility
  React.useEffect(() => {
    if (course.category && (!course.categories || course.categories.length === 0)) {
      console.log('🔄 Auto-syncing category to categories array:', course.category);
      handleFieldUpdate('categories', [course.category]);
    }
  }, [course.category]);
  
  // Get dynamic categories from content
  const dynamicCategories = content?.courseCategories || {};

  // Validate slug uniqueness
  const validateSlug = (newSlug) => {
    if (!newSlug) {
      setSlugError('Slug is required');
      return false;
    }
    
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(newSlug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    
    const isUnique = !courses.some((c, i) => 
      i !== index && c.slug === newSlug
    );
    
    if (!isUnique) {
      setSlugError('This slug is already taken. Please choose a different one.');
      return false;
    }
    
    setSlugError('');
    return true;
  };

  const handleFieldUpdate = (field, value) => {
    if (field === 'slug') {
      validateSlug(value);
    }
    onUpdate(index, field, value);
  };

  const handleArrayFieldAdd = (field, value) => {
    if (value.trim()) {
      const currentArray = course[field] || [];
      handleFieldUpdate(field, [...currentArray, value.trim()]);
      return true;
    }
    return false;
  };

  const handleArrayFieldRemove = (field, itemIndex) => {
    const currentArray = course[field] || [];
    handleFieldUpdate(field, currentArray.filter((_, i) => i !== itemIndex));
  };

  const ArrayFieldEditor = ({ 
    field, 
    label, 
    placeholder, 
    inputType = 'text' 
  }) => {
    const [inputValue, setInputValue] = useState('');
    const items = course[field] || [];

    const handleAdd = () => {
      if (handleArrayFieldAdd(field, inputValue)) {
        setInputValue('');
        toast.success(`Added "${inputValue}" to ${label.toLowerCase()}`);
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        
        {/* Display existing items */}
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((item, itemIndex) => (
            <span
              key={itemIndex}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
            >
              {item}
              <button
                onClick={() => handleArrayFieldRemove(field, itemIndex)}
                className="text-blue-600 hover:text-blue-800 ml-1"
                type="button"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        
        {/* Add new item */}
        <div className="flex gap-2">
          <input
            type={inputType}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="form-input flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <button
            onClick={handleAdd}
            className="btn-outline px-3"
            type="button"
          >
            Add
          </button>
        </div>
      </div>
    );
  };

  const sections = [
    { id: 'basic', name: 'Basic Info' },
    { id: 'content', name: 'Content' },
    { id: 'details', name: 'Course Details' },
    { id: 'seo', name: 'SEO & Meta' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Course Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
          
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">#{course.order || index + 1}</span>
            <h3 className="text-lg font-medium text-gray-900">
              {course.title || 'Untitled Course'}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {course.visible ? (
              <Eye className="h-4 w-4 text-green-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
            
            {slugError && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            
            {!slugError && course.slug && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <span className="text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {course.category === 'certification' && '🔴 Red Hat'}
            {course.category === 'cloud' && '☁️ AWS'}
            {course.category === 'container' && '⚙️ Kubernetes'}
            {course.category === 'devops' && '🔧 DevOps'}
            {course.category === 'security' && '🛡️ Cybersecurity'}
            {course.category === 'programming' && '💻 Programming'}
            {course.category === 'degree' && '🎓 Degree'}
            {!course.category && '📚 Uncategorized'}
            {course.category && !['certification', 'cloud', 'container', 'devops', 'security', 'programming', 'degree'].includes(course.category) && '📚 Other'}
          </span>
          
          <button
            onClick={() => onMove(index, 'up')}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            ↑
          </button>
          
          <button
            onClick={() => onMove(index, 'down')}
            disabled={index === courses.length - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            ↓
          </button>
          
          <button
            onClick={() => onDelete(index)}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded Course Editor */}
      {isExpanded && (
        <div className="p-4">
          {/* Section Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Basic Info Section */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={course.title || ''}
                    onChange={(e) => handleFieldUpdate('title', e.target.value)}
                    className="form-input"
                    placeholder="Enter course title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL) *
                  </label>
                  <input
                    type="text"
                    value={course.slug || ''}
                    onChange={(e) => handleFieldUpdate('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className={`form-input ${slugError ? 'border-red-300' : ''}`}
                    placeholder="course-url-slug"
                  />
                  {slugError && (
                    <p className="text-red-500 text-sm mt-1">{slugError}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    One-liner Description *
                  </label>
                  <input
                    type="text"
                    value={course.oneLiner || ''}
                    onChange={(e) => handleFieldUpdate('oneLiner', e.target.value)}
                    className="form-input"
                    placeholder="Brief description of the course"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={course.duration || ''}
                    onChange={(e) => handleFieldUpdate('duration', e.target.value)}
                    className="form-input"
                    placeholder="e.g., 6 Months"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fees
                  </label>
                  <input
                    type="text"
                    value={course.fees || ''}
                    onChange={(e) => handleFieldUpdate('fees', e.target.value)}
                    className="form-input"
                    placeholder="e.g., ₹20,000 or Contact for fees"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={course.category || ''}
                    onChange={(e) => {
                      const selectedCategory = e.target.value;
                      // Save both formats for compatibility
                      handleFieldUpdate('category', selectedCategory);
                      // FIXED: Also save as categories array for frontend compatibility
                      handleFieldUpdate('categories', selectedCategory ? [selectedCategory] : []);
                      console.log('✅ Category updated:', { category: selectedCategory, categories: selectedCategory ? [selectedCategory] : [] });
                    }}
                    className="form-input"
                  >
                    <option value="">Select category</option>
                    {Object.entries(dynamicCategories)
                      .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999))
                      .map(([slug, category]) => (
                        <option key={slug} value={slug}>
                          {category.icon === 'server' && '🔴'} 
                          {category.icon === 'cloud' && '☁️'} 
                          {category.icon === 'container' && '⚙️'} 
                          {category.icon === 'terminal' && '🔧'} 
                          {category.icon === 'shield' && '🛡️'} 
                          {category.icon === 'code' && '💻'} 
                          {category.icon === 'graduation-cap' && '🎓'} 
                          {!['server', 'cloud', 'container', 'terminal', 'shield', 'code', 'graduation-cap'].includes(category.icon) && '📚'} 
                          &nbsp;{category.name}
                        </option>
                      ))}
                    {Object.keys(dynamicCategories).length === 0 && (
                      <option disabled>No categories available - Add categories first</option>
                    )}
                  </select>
                  <div className="mt-1 text-xs text-gray-500">
                    {Object.keys(dynamicCategories).length > 0 
                      ? "This determines which category the course belongs to" 
                      : "Add categories in the Categories tab first"}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    value={course.level || ''}
                    onChange={(e) => handleFieldUpdate('level', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select level</option>
                    <optgroup label="🔴 Red Hat Levels">
                      <option value="Foundation Level">Foundation Level</option>
                      <option value="Professional Level">Professional Level</option>
                      <option value="Specialist Level">Specialist Level</option>
                    </optgroup>
                    <optgroup label="☁️ AWS Levels">
                      <option value="Foundation Level">Foundation Level</option>
                      <option value="Associate Level">Associate Level</option>
                      <option value="Professional Level">Professional Level</option>
                    </optgroup>
                    <optgroup label="⚙️ Kubernetes Levels">
                      <option value="Administrator Level">Administrator Level</option>
                      <option value="Security Level">Security Level</option>
                      <option value="Developer Level">Developer Level</option>
                    </optgroup>
                    <optgroup label="🔧 DevOps Levels">
                      <option value="Foundation Level">Foundation Level</option>
                      <option value="Professional Level">Professional Level</option>
                      <option value="Expert Level">Expert Level</option>
                    </optgroup>
                    <optgroup label="🛡️ Cybersecurity Levels">
                      <option value="Foundation Level">Foundation Level</option>
                      <option value="Professional Level">Professional Level</option>
                      <option value="Expert Level">Expert Level</option>
                    </optgroup>
                    <optgroup label="💻 Programming Levels">
                      <option value="Beginner Level">Beginner Level</option>
                      <option value="Intermediate Level">Intermediate Level</option>
                      <option value="Professional Level">Professional Level</option>
                    </optgroup>
                    <optgroup label="🎓 Degree Levels">
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Certification">Certification</option>
                    </optgroup>
                    <optgroup label="📚 General Levels">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </optgroup>
                  </select>
                  <div className="mt-1 text-xs text-gray-500">
                    This determines which level section the course appears in within its category
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={course.thumbnailUrl || ''}
                    onChange={(e) => handleFieldUpdate('thumbnailUrl', e.target.value)}
                    className="form-input"
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={course.order || ''}
                    onChange={(e) => handleFieldUpdate('order', parseInt(e.target.value) || 1)}
                    className="form-input"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={course.visible !== false}
                    onChange={(e) => handleFieldUpdate('visible', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Visible on website</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={course.featured || false}
                    onChange={(e) => handleFieldUpdate('featured', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured course</span>
                </label>
              </div>
            </div>
          )}

          {/* Content Section */}
          {activeSection === 'content' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Overview
                </label>
                <textarea
                  value={course.overview || ''}
                  onChange={(e) => handleFieldUpdate('overview', e.target.value)}
                  className="form-textarea"
                  rows={4}
                  placeholder="Detailed description of the course..."
                />
              </div>
              
              <ArrayFieldEditor
                field="tools"
                label="Tools & Technologies"
                placeholder="Add a tool or technology"
              />
              
              <ArrayFieldEditor
                field="highlights"
                label="Course Highlights"
                placeholder="Add a course highlight"
              />
              
              <ArrayFieldEditor
                field="learningOutcomes"
                label="Learning Outcomes"
                placeholder="Add a learning outcome"
              />
              
              <ArrayFieldEditor
                field="careerRoles"
                label="Career Roles"
                placeholder="Add a career role"
              />
            </div>
          )}

          {/* Course Details Section */}
          {activeSection === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate Information
                </label>
                <textarea
                  value={course.certificateInfo || ''}
                  onChange={(e) => handleFieldUpdate('certificateInfo', e.target.value)}
                  className="form-textarea"
                  rows={3}
                  placeholder="Information about certificates provided..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Information
                </label>
                <textarea
                  value={course.batchesInfo || ''}
                  onChange={(e) => handleFieldUpdate('batchesInfo', e.target.value)}
                  className="form-textarea"
                  rows={3}
                  placeholder="Information about batch schedules, intake, etc..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eligibility Criteria
                </label>
                <input
                  type="text"
                  value={course.eligibility || ''}
                  onChange={(e) => handleFieldUpdate('eligibility', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 12th Pass, Graduate, Basic Programming Knowledge"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode of Training
                </label>
                <div className="flex gap-4">
                  {['Classroom', 'Online', 'Hybrid'].map((mode) => (
                    <label key={mode} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(course.mode || []).includes(mode)}
                        onChange={(e) => {
                          const currentMode = course.mode || [];
                          if (e.target.checked) {
                            handleFieldUpdate('mode', [...currentMode, mode]);
                          } else {
                            handleFieldUpdate('mode', currentMode.filter(m => m !== mode));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEO Section */}
          {activeSection === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={course.seo?.title || ''}
                  onChange={(e) => handleFieldUpdate('seo', { 
                    ...course.seo, 
                    title: e.target.value 
                  })}
                  className="form-input"
                  placeholder="SEO optimized title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Description
                </label>
                <textarea
                  value={course.seo?.description || ''}
                  onChange={(e) => handleFieldUpdate('seo', { 
                    ...course.seo, 
                    description: e.target.value 
                  })}
                  className="form-textarea"
                  rows={3}
                  placeholder="SEO meta description (150-160 characters)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  value={course.seo?.keywords || ''}
                  onChange={(e) => handleFieldUpdate('seo', { 
                    ...course.seo, 
                    keywords: e.target.value 
                  })}
                  className="form-input"
                  placeholder="comma, separated, keywords"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OG Image URL
                </label>
                <input
                  type="url"
                  value={course.seo?.ogImage || ''}
                  onChange={(e) => handleFieldUpdate('seo', { 
                    ...course.seo, 
                    ogImage: e.target.value 
                  })}
                  className="form-input"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseEditor;