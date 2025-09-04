import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Eye, EyeOff, Save, X, Search, Filter, BookOpen, Clock, Users, Star, ChevronDown, ChevronUp, ChevronRight, DollarSign } from 'lucide-react';

const CourseManager = ({ content, updateContent }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    overview: '',
    oneLiner: '',
    category: '',
    categories: [],
    price: '',
    fees: '',
    duration: '',
    level: 'Beginner',
    visible: true,
    featured: false,
    order: 1,
    highlights: [],
    syllabus: [],
    tools: [],
    learningOutcomes: [],
    careerRoles: [],
    eligibility: '',
    mode: 'Classroom, Online, Hybrid',
    certificationIncluded: false
  });

  const courses = content?.courses || [];
  const categories = content?.courseCategories || {};

  useEffect(() => {
    if (courses.length > 0) {
      const maxOrder = Math.max(0, ...courses.map(c => c.order || 0));
      setNewCourse(prev => ({ ...prev, order: maxOrder + 1 }));
    }
  }, [courses]);

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Reset form
  const resetForm = () => {
    const maxOrder = Math.max(0, ...courses.map(c => c.order || 0));
    setNewCourse({
      title: '',
      description: '',
      overview: '',
      oneLiner: '',
      category: '',
      categories: [],
      price: '',
      fees: '',
      duration: '',
      level: 'Beginner',
      visible: true,
      featured: false,
      order: maxOrder + 1,
      highlights: [],
      syllabus: [],
      tools: [],
      learningOutcomes: [],
      careerRoles: [],
      eligibility: '',
      mode: 'Classroom, Online, Hybrid',
      certificationIncluded: false
    });
  };

  // Add new course
  const addCourse = () => {
    if (!newCourse.title.trim()) {
      alert('Course title is required!');
      return;
    }

    const slug = generateSlug(newCourse.title);
    if (courses.find(course => course.slug === slug)) {
      alert('Course with this title already exists!');
      return;
    }

    const courseData = {
      ...newCourse,
      slug: slug,
      categories: newCourse.category ? [newCourse.category] : [],
      // Ensure visible is always set to true by default
      visible: newCourse.visible !== false,
      // Ensure required fields exist
      title: newCourse.title || '',
      description: newCourse.description || 'Course description will be updated soon.',
      overview: newCourse.overview || 'Detailed course overview will be provided.',
      // Ensure fees field is set from price if empty
      fees: newCourse.fees || newCourse.price || 'Contact for pricing',
      // Ensure required arrays exist
      highlights: newCourse.highlights || [],
      tools: newCourse.tools || [],
      learningOutcomes: newCourse.learningOutcomes || [],
      careerRoles: newCourse.careerRoles || [],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    console.log('➕ Adding course:', slug, courseData);

    updateContent('courses', [...courses, courseData]);

    setShowAddForm(false);
    resetForm();
    alert(`✅ Course "${newCourse.title}" added successfully!`);
  };

  // Update Course
  const updateCourse = (slug, field, value) => {
    const updatedCourses = courses.map(course => {
      if (course.slug === slug) {
        const updated = { ...course };
        
        if (field.includes('.')) {
          // Handle nested fields
          const [parent, child] = field.split('.');
          updated[parent] = { ...updated[parent], [child]: value };
        } else {
          updated[field] = value;
          
          // If category is updated, also update categories array
          if (field === 'category') {
            updated.categories = value ? [value] : [];
          }
        }
        
        updated.modifiedAt = new Date().toISOString();
        return updated;
      }
      return course;
    });

    console.log('📝 Updating course:', slug, field, value);
    updateContent('courses', updatedCourses);
  };

  // Delete course
  const deleteCourse = (slug) => {
    const course = courses.find(c => c.slug === slug);
    if (!course) return;
    
    if (!confirm(`Delete "${course.title}"?`)) return;

    const updatedCourses = courses.filter(course => course.slug !== slug);
    console.log('🗑️ Deleting course:', slug, course.title);
    updateContent('courses', updatedCourses);
    
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      newSet.delete(slug);
      return newSet;
    });

    alert(`✅ Course "${course.title}" deleted!`);
  };

  // Toggle course expansion
  const toggleExpanded = (slug) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
      } else {
        newSet.add(slug);
      }
      return newSet;
    });
  };

  // Quick toggle visibility
  const toggleVisibility = (slug) => {
    const updatedCourses = courses.map(course => 
      course.slug === slug 
        ? { ...course, visible: !course.visible, modifiedAt: new Date().toISOString() }
        : course
    );
    updateContent('courses', updatedCourses);
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || 
                           (course.categories && course.categories.includes(filterCategory));
    return matchesSearch && matchesCategory;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  // Handle array field updates (comma-separated)
  const handleArrayField = (field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setNewCourse(prev => ({ ...prev, [field]: arrayValue }));
  };

  // Add highlight
  const addHighlight = (slug) => {
    const highlight = prompt('Add highlight:');
    if (!highlight) return;

    const course = courses.find(c => c.slug === slug);
    const updatedHighlights = [...(course.highlights || []), highlight];
    updateCourse(slug, 'highlights', updatedHighlights);
  };

  // Remove highlight
  const removeHighlight = (slug, index) => {
    const course = courses.find(c => c.slug === slug);
    const updatedHighlights = course.highlights.filter((_, i) => i !== index);
    updateCourse(slug, 'highlights', updatedHighlights);
  };

  const sortedCourses = courses.sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Course Management</h2>
            <p className="text-blue-100">Manage your course catalog with advanced tools</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add New Course
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Visible</p>
              <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.visible !== false).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.featured).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(categories).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Categories</option>
                {Object.entries(categories).map(([slug, category]) => (
                  <option key={slug} value={slug}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add Course Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Course</h3>
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
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                    className="w-full border rounded p-2"
                    placeholder="e.g. Complete DevOps Mastery"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select Category</option>
                    {Object.entries(categories).map(([slug, category]) => (
                      <option key={slug} value={slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="w-full border rounded p-2"
                  rows="3"
                  placeholder="Brief course description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Overview</label>
                <textarea
                  value={newCourse.overview}
                  onChange={(e) => setNewCourse({...newCourse, overview: e.target.value})}
                  className="w-full border rounded p-2"
                  rows="4"
                  placeholder="Detailed course overview..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">One Liner (Course Summary)</label>
                <input
                  type="text"
                  value={newCourse.oneLiner}
                  onChange={(e) => setNewCourse({...newCourse, oneLiner: e.target.value})}
                  className="w-full border rounded p-2"
                  placeholder="Professional rhcsa - red hat system administrator certification training..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Eligibility Requirements</label>
                <input
                  type="text"
                  value={newCourse.eligibility}
                  onChange={(e) => setNewCourse({...newCourse, eligibility: e.target.value})}
                  className="w-full border rounded p-2"
                  placeholder="12th Pass/Graduate with basic computer knowledge"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (Display)</label>
                  <input
                    type="text"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                    className="w-full border rounded p-2"
                    placeholder="e.g. ₹25,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fees (Course Fee)</label>
                  <input
                    type="text"
                    value={newCourse.fees}
                    onChange={(e) => setNewCourse({...newCourse, fees: e.target.value})}
                    className="w-full border rounded p-2"
                    placeholder="e.g. ₹30000 (Including Exam)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <input
                    type="text"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                    className="w-full border rounded p-2"
                    placeholder="e.g. 6-8 weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                    className="w-full border rounded p-2"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional Level">Professional Level</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mode</label>
                  <input
                    type="text"
                    value={newCourse.mode}
                    onChange={(e) => setNewCourse({...newCourse, mode: e.target.value})}
                    className="w-full border rounded p-2"
                    placeholder="Classroom, Online, Hybrid"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={newCourse.order}
                    onChange={(e) => setNewCourse({...newCourse, order: parseInt(e.target.value) || 1})}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Certificate Included</label>
                  <select
                    value={newCourse.certificationIncluded}
                    onChange={(e) => setNewCourse({...newCourse, certificationIncluded: e.target.value === 'true'})}
                    className="w-full border rounded p-2"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              {/* Array Fields - Comma Separated Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tools & Technologies</label>
                  <input
                    type="text"
                    value={newCourse.tools.join(', ')}
                    onChange={(e) => {
                      const toolsArray = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                      setNewCourse({...newCourse, tools: toolsArray});
                    }}
                    className="w-full border rounded p-2"
                    placeholder="React, Node.js, MongoDB, Docker, Kubernetes"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newCourse.tools.map((tool, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Learning Outcomes (What You'll Learn)</label>
                  <textarea
                    value={newCourse.learningOutcomes.join(', ')}
                    onChange={(e) => {
                      const outcomesArray = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                      setNewCourse({...newCourse, learningOutcomes: outcomesArray});
                    }}
                    className="w-full border rounded p-2"
                    rows="3"
                    placeholder="Manage RHEL systems and users, Configure local storage and file systems, Control services processes and boot sequence"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newCourse.learningOutcomes.map((outcome, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Career Opportunities</label>
                  <input
                    type="text"
                    value={newCourse.careerRoles.join(', ')}
                    onChange={(e) => {
                      const rolesArray = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                      setNewCourse({...newCourse, careerRoles: rolesArray});
                    }}
                    className="w-full border rounded p-2"
                    placeholder="Linux System Administrator, Junior DevOps Engineer, Support Engineer"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newCourse.careerRoles.map((role, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Course Highlights</label>
                  <input
                    type="text"
                    value={newCourse.highlights.join(', ')}
                    onChange={(e) => {
                      const highlightsArray = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                      setNewCourse({...newCourse, highlights: highlightsArray});
                    }}
                    className="w-full border rounded p-2"
                    placeholder="User & group management, Storage & networking basics, System services, SELinux & firewalld"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newCourse.highlights.map((highlight, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Visible</label>
                  <select
                    value={newCourse.visible}
                    onChange={(e) => setNewCourse({...newCourse, visible: e.target.value === 'true'})}
                    className="w-full border rounded p-2"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Featured</label>
                  <select
                    value={newCourse.featured}
                    onChange={(e) => setNewCourse({...newCourse, featured: e.target.value === 'true'})}
                    className="w-full border rounded p-2"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
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
                onClick={addCourse}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Course
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No courses yet</p>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create First Course
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div key={course.slug} className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {course.price && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {course.price}
                      </span>
                    )}
                    {course.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {course.level}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    course.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.visible ? 'Visible' : 'Hidden'}
                  </span>
                  {course.featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                      Featured
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCourse(course.slug, 'visible', !course.visible)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    {course.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  
                  <button
                    onClick={() => toggleExpanded(course.slug)}
                    className="p-2 hover:bg-gray-100 rounded text-blue-600"
                  >
                    {expandedCourses.has(course.slug) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  
                  <button
                    onClick={() => deleteCourse(course.slug)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-200 ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedCourses.has(course.slug) && (
                <div className="space-y-4 pt-4 border-t bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={course.title}
                        onChange={(e) => updateCourse(course.slug, 'title', e.target.value)}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={course.category || ''}
                        onChange={(e) => updateCourse(course.slug, 'category', e.target.value)}
                        className="w-full border rounded p-2"
                      >
                        <option value="">Select Category</option>
                        {Object.entries(categories).map(([slug, category]) => (
                          <option key={slug} value={slug}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={course.description || ''}
                      onChange={(e) => updateCourse(course.slug, 'description', e.target.value)}
                      className="w-full border rounded p-2"
                      rows="2"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price</label>
                      <input
                        type="text"
                        value={course.price || ''}
                        onChange={(e) => updateCourse(course.slug, 'price', e.target.value)}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <input
                        type="text"
                        value={course.duration || ''}
                        onChange={(e) => updateCourse(course.slug, 'duration', e.target.value)}
                        className="w-full border rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Level</label>
                      <select
                        value={course.level || 'Beginner'}
                        onChange={(e) => updateCourse(course.slug, 'level', e.target.value)}
                        className="w-full border rounded p-2"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Order</label>
                      <input
                        type="number"
                        value={course.order || 1}
                        onChange={(e) => updateCourse(course.slug, 'order', parseInt(e.target.value))}
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Highlights</label>
                    <div className="space-y-2">
                      {(course.highlights || []).map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => {
                              const newHighlights = [...course.highlights];
                              newHighlights[index] = e.target.value;
                              updateCourse(course.slug, 'highlights', newHighlights);
                            }}
                            className="flex-1 border rounded p-2"
                          />
                          <button
                            onClick={() => removeHighlight(course.slug, index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addHighlight(course.slug)}
                        className="w-full border-2 border-dashed border-gray-300 rounded p-2 text-gray-500 hover:border-blue-300 hover:text-blue-500"
                      >
                        + Add Highlight
                      </button>
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

export default CourseManager;