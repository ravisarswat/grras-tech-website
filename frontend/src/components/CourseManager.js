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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Add New Course</h3>
                  <p className="text-gray-600">Create a comprehensive course with all details</p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title *</label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g. Complete DevOps Mastery Training"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {Object.entries(categories).map(([slug, category]) => (
                        <option key={slug} value={slug}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Description</label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows="3"
                    placeholder="Brief description of the course..."
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Overview</label>
                  <textarea
                    value={newCourse.overview}
                    onChange={(e) => setNewCourse({...newCourse, overview: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows="4"
                    placeholder="Comprehensive course overview and learning objectives..."
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">One Liner (Marketing Tagline)</label>
                  <input
                    type="text"
                    value={newCourse.oneLiner}
                    onChange={(e) => setNewCourse({...newCourse, oneLiner: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Professional certification training with hands-on experience..."
                  />
                </div>
              </div>

              {/* Course Details Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Course Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Display)</label>
                    <input
                      type="text"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="₹25,000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Fees</label>
                    <input
                      type="text"
                      value={newCourse.fees}
                      onChange={(e) => setNewCourse({...newCourse, fees: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="₹30000 (Including Exam)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="6-8 weeks"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
                    <select
                      value={newCourse.level}
                      onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Professional Level">Professional Level</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
                    <input
                      type="text"
                      value={newCourse.mode}
                      onChange={(e) => setNewCourse({...newCourse, mode: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Classroom, Online, Hybrid"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Eligibility</label>
                    <input
                      type="text"
                      value={newCourse.eligibility}
                      onChange={(e) => setNewCourse({...newCourse, eligibility: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="12th Pass/Graduate with basic computer knowledge"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Order</label>
                    <input
                      type="number"
                      value={newCourse.order}
                      onChange={(e) => setNewCourse({...newCourse, order: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Course Content Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Course Content (Comma-separated)
                </h4>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tools & Technologies</label>
                    <input
                      type="text"
                      value={newCourse.tools.join(', ')}
                      onChange={(e) => handleArrayField('tools', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="React, Node.js, MongoDB, Docker, Kubernetes, AWS"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {newCourse.tools.map((tool, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Outcomes (What You'll Learn)</label>
                    <textarea
                      value={newCourse.learningOutcomes.join(', ')}
                      onChange={(e) => handleArrayField('learningOutcomes', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="3"
                      placeholder="Manage RHEL systems and users, Configure local storage and file systems, Control services processes and boot sequence"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {newCourse.learningOutcomes.map((outcome, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {outcome}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course Highlights</label>
                    <input
                      type="text"
                      value={newCourse.highlights.join(', ')}
                      onChange={(e) => handleArrayField('highlights', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="User & group management, Storage & networking basics, System services, SELinux & firewalld"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {newCourse.highlights.map((highlight, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Career Opportunities</label>
                    <input
                      type="text"
                      value={newCourse.careerRoles.join(', ')}
                      onChange={(e) => handleArrayField('careerRoles', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Linux System Administrator, Junior DevOps Engineer, Support Engineer"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {newCourse.careerRoles.map((role, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Course Settings
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Visibility</label>
                    <select
                      value={newCourse.visible}
                      onChange={(e) => setNewCourse({...newCourse, visible: e.target.value === 'true'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="true">✅ Visible (Published)</option>
                      <option value="false">❌ Hidden (Draft)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Course</label>
                    <select
                      value={newCourse.featured}
                      onChange={(e) => setNewCourse({...newCourse, featured: e.target.value === 'true'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="false">⭐ Regular Course</option>
                      <option value="true">🌟 Featured Course</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Certificate Included</label>
                    <select
                      value={newCourse.certificationIncluded}
                      onChange={(e) => setNewCourse({...newCourse, certificationIncluded: e.target.value === 'true'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="false">📄 No Certificate</option>
                      <option value="true">🏆 Certificate Included</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addCourse}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Create Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {searchTerm || filterCategory !== 'all' ? 'No courses match your search criteria' : 'No courses yet'}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Add Your First Course
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course, index) => (
            <div key={course.slug} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              {/* Course Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleExpanded(course.slug)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedCourses.has(course.slug) ? 
                        <ChevronDown className="h-4 w-4 text-gray-600" /> : 
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      }
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                        {course.featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          course.visible !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {course.visible !== false ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </>
                          )}
                        </span>
                        {course.categories && course.categories.length > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {categories[course.categories[0]]?.name || course.categories[0]}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {course.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {course.duration}
                          </div>
                        )}
                        {course.fees && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {course.fees}
                          </div>
                        )}
                        {course.level && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.level}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          Order: {course.order || index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(course.slug)}
                      className={`p-2 rounded-lg transition-colors ${
                        course.visible !== false 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                      title={course.visible !== false ? 'Hide Course' : 'Show Course'}
                    >
                      {course.visible !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => deleteCourse(course.slug)}
                      className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Course Details */}
              {expandedCourses.has(course.slug) && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                          {course.overview || 'No overview provided'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">One Liner</label>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                          {course.oneLiner || 'No one liner provided'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                          {course.eligibility || 'Not specified'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                          {course.mode || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {/* Arrays Display */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2">Course Details</h4>
                      
                      {course.highlights && course.highlights.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Course Highlights</label>
                          <div className="flex flex-wrap gap-1">
                            {course.highlights.map((highlight, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {course.tools && course.tools.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tools & Technologies</label>
                          <div className="flex flex-wrap gap-1">
                            {course.tools.map((tool, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Learning Outcomes</label>
                          <div className="flex flex-wrap gap-1">
                            {course.learningOutcomes.map((outcome, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {outcome}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {course.careerRoles && course.careerRoles.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Career Opportunities</label>
                          <div className="flex flex-wrap gap-1">
                            {course.careerRoles.map((role, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Created: {new Date(course.createdAt || Date.now()).toLocaleDateString()}</p>
                          <p>Modified: {new Date(course.modifiedAt || Date.now()).toLocaleDateString()}</p>
                          <p>Slug: {course.slug}</p>
                        </div>
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

export default CourseManager;