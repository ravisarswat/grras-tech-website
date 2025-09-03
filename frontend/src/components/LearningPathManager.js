import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Route, ArrowRight, Clock, User, Target, Briefcase, Globe } from 'lucide-react';

const LearningPathManager = ({ content, updateContent }) => {
  const [expandedPath, setExpandedPath] = useState(null);

  const learningPaths = content?.learningPaths || {};
  const courses = content?.courses || [];

  const addLearningPath = () => {
    const timestamp = Date.now();
    const newPath = {
      title: 'New Learning Path',
      slug: `new-path-${timestamp}`,
      description: 'Comprehensive learning journey description',
      duration: '3-6 months',
      level: 'Beginner to Advanced',
      totalCourses: 0,
      estimatedHours: 120,
      featured: false,
      courses: [],
      outcomes: [],
      careerRoles: [],
      averageSalary: '₹6-12 LPA',
      seo: {
        title: '',
        description: '',
        keywords: ''
      }
    };
    
    const newPaths = {
      ...learningPaths,
      [newPath.slug]: newPath
    };
    
    updateContent('learningPaths', newPaths);
  };

  const updatePath = (pathSlug, field, value) => {
    console.log('🔄 updatePath called:', { pathSlug, field, value });
    console.log('📋 Current learningPaths:', learningPaths);
    
    const newPaths = { ...learningPaths };
    
    if (field === 'slug' && value !== pathSlug) {
      newPaths[value] = { ...newPaths[pathSlug], slug: value };
      delete newPaths[pathSlug];
    } else {
      newPaths[pathSlug] = { ...newPaths[pathSlug], [field]: value };
    }
    
    console.log('🆕 Updated paths:', newPaths);
    console.log('📊 Updated path data:', newPaths[pathSlug]);
    
    updateContent('learningPaths', newPaths);
    
    console.log('✅ updateContent called for learningPaths');
  };

  const updatePathSEO = (pathSlug, field, value) => {
    const newPaths = { ...learningPaths };
    newPaths[pathSlug] = {
      ...newPaths[pathSlug],
      seo: {
        ...newPaths[pathSlug].seo,
        [field]: value
      }
    };
    updateContent('learningPaths', newPaths);
  };

  const deletePath = (pathSlug) => {
    if (window.confirm('Are you sure you want to delete this learning path? This action cannot be undone.')) {
      const newPaths = { ...learningPaths };
      delete newPaths[pathSlug];
      updateContent('learningPaths', newPaths);
    }
  };

  const togglePathFeatured = (pathSlug) => {
    const path = learningPaths[pathSlug];
    updatePath(pathSlug, 'featured', !path.featured);
  };

  const addCourseToPath = (pathSlug) => {
    console.log('🚀 Add Course button clicked!', { pathSlug, availableCoursesCount: availableCourses.length });
    
    try {
      const path = learningPaths[pathSlug];
      console.log('📋 Learning Path:', path);
      
      // Check if there are available courses to add
      if (availableCourses.length === 0) {
        console.error('❌ No available courses');
        alert('No courses available. Please add courses first in the Courses section.');
        return;
      }
      
      const newCourse = {
        courseSlug: '',
        order: (path.courses?.length || 0) + 1,
        title: 'Select a course...',
        duration: '4 weeks',
        prerequisite: false
      };
      
      console.log('➕ Creating new course:', newCourse);
      
      const newCourses = [...(path.courses || []), newCourse];
      console.log('📚 Updated courses array:', newCourses);
      console.log('🔢 New courses length:', newCourses.length);
      
      // Update both courses and totalCourses in single call to avoid race conditions
      const updatedPath = {
        ...path,
        courses: newCourses,
        totalCourses: newCourses.length
      };
      
      console.log('📝 Complete updated path:', updatedPath);
      
      // Update the learning paths object
      const newPaths = {
        ...learningPaths,
        [pathSlug]: updatedPath
      };
      
      console.log('🗂️ Complete updated learning paths:', newPaths);
      
      updateContent('learningPaths', newPaths);
      
      // Show success message
      console.log(`✅ Successfully added new course slot to learning path: ${path.title}`);
      alert(`✅ Course slot added successfully! Total courses: ${newCourses.length}`);
      
    } catch (error) {
      console.error('❌ Error in addCourseToPath:', error);
      alert(`Error adding course: ${error.message}`);
    }
  };

  const updatePathCourse = (pathSlug, courseIndex, field, value) => {
    const path = learningPaths[pathSlug];
    const newCourses = [...path.courses];
    newCourses[courseIndex] = { ...newCourses[courseIndex], [field]: value };
    
    // Auto-update title if courseSlug changes
    if (field === 'courseSlug' && value) {
      const selectedCourse = courses.find(c => c.slug === value);
      if (selectedCourse) {
        newCourses[courseIndex].title = selectedCourse.title;
      }
    }
    
    updatePath(pathSlug, 'courses', newCourses);
  };

  const removePathCourse = (pathSlug, courseIndex) => {
    const path = learningPaths[pathSlug];
    const newCourses = path.courses.filter((_, i) => i !== courseIndex);
    
    // Reorder courses
    newCourses.forEach((course, index) => {
      course.order = index + 1;
    });
    
    updatePath(pathSlug, 'courses', newCourses);
    updatePath(pathSlug, 'totalCourses', newCourses.length);
  };

  const movePathCourse = (pathSlug, courseIndex, direction) => {
    const path = learningPaths[pathSlug];
    const newCourses = [...path.courses];
    const targetIndex = direction === 'up' ? courseIndex - 1 : courseIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newCourses.length) {
      [newCourses[courseIndex], newCourses[targetIndex]] = [newCourses[targetIndex], newCourses[courseIndex]];
      
      // Update order values
      newCourses.forEach((course, i) => {
        course.order = i + 1;
      });
      
      updatePath(pathSlug, 'courses', newCourses);
    }
  };

  const addOutcome = (pathSlug) => {
    const path = learningPaths[pathSlug];
    const newOutcomes = [...(path.outcomes || []), 'New learning outcome'];
    updatePath(pathSlug, 'outcomes', newOutcomes);
  };

  const updateOutcome = (pathSlug, index, value) => {
    const path = learningPaths[pathSlug];
    const newOutcomes = [...path.outcomes];
    newOutcomes[index] = value;
    updatePath(pathSlug, 'outcomes', newOutcomes);
  };

  const removeOutcome = (pathSlug, index) => {
    const path = learningPaths[pathSlug];
    const newOutcomes = path.outcomes.filter((_, i) => i !== index);
    updatePath(pathSlug, 'outcomes', newOutcomes);
  };

  const addCareerRole = (pathSlug) => {
    const path = learningPaths[pathSlug];
    const newRoles = [...(path.careerRoles || []), 'New career role'];
    updatePath(pathSlug, 'careerRoles', newRoles);
  };

  const updateCareerRole = (pathSlug, index, value) => {
    const path = learningPaths[pathSlug];
    const newRoles = [...path.careerRoles];
    newRoles[index] = value;
    updatePath(pathSlug, 'careerRoles', newRoles);
  };

  const removeCareerRole = (pathSlug, index) => {
    const path = learningPaths[pathSlug];
    const newRoles = path.careerRoles.filter((_, i) => i !== index);
    updatePath(pathSlug, 'careerRoles', newRoles);
  };

  // Safe check for available courses to prevent undefined errors
  const availableCourses = courses.filter(course => 
    course && course.visible !== false && course.slug && course.title
  );

  const levelOptions = [
    'Beginner',
    'Intermediate', 
    'Advanced',
    'Beginner to Intermediate',
    'Intermediate to Advanced',
    'Beginner to Advanced',
    'All Levels'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Learning Paths</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create structured learning journeys that guide students through multiple courses
          </p>
        </div>
        <button
          onClick={addLearningPath}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Learning Path
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Route className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="text-green-900 font-medium">Learning Path Strategy</h4>
            <p className="text-green-800 text-sm mt-1">
              Learning paths combine multiple courses into career-focused journeys. They help students 
              understand prerequisites, course progression, and expected outcomes for specific career goals.
            </p>
          </div>
        </div>
      </div>

      {Object.keys(learningPaths).length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Learning Paths Yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first learning path to guide students through structured course progressions.
          </p>
          <button
            onClick={addLearningPath}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Create First Path
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(learningPaths).map(([pathSlug, path]) => (
            <div key={pathSlug} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Path Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Route className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{path.title}</h3>
                      <p className="text-sm text-gray-500">
                        {path.totalCourses || 0} courses • {path.duration} • {path.featured ? 'Featured' : 'Regular'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePathFeatured(pathSlug)}
                      className={`p-2 rounded-lg ${
                        path.featured 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title={path.featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      {path.featured ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => setExpandedPath(
                        expandedPath === pathSlug ? null : pathSlug
                      )}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      {expandedPath === pathSlug ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </button>
                    
                    <button
                      onClick={() => deletePath(pathSlug)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Path Details (Expandable) */}
              {expandedPath === pathSlug && (
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Path Title
                      </label>
                      <input
                        type="text"
                        value={path.title}
                        onChange={(e) => updatePath(pathSlug, 'title', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Cloud Engineer Career Path"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={path.slug}
                        onChange={(e) => updatePath(pathSlug, 'slug', e.target.value)}
                        className="form-input"
                        placeholder="e.g., cloud-engineer-path"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={path.description}
                      onChange={(e) => updatePath(pathSlug, 'description', e.target.value)}
                      className="form-textarea"
                      rows={3}
                      placeholder="Describe this learning journey and what students will achieve..."
                    />
                  </div>

                  {/* Path Details */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Duration
                      </label>
                      <input
                        type="text"
                        value={path.duration}
                        onChange={(e) => updatePath(pathSlug, 'duration', e.target.value)}
                        className="form-input"
                        placeholder="e.g., 6-8 months"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-1" />
                        Level
                      </label>
                      <select
                        value={path.level}
                        onChange={(e) => updatePath(pathSlug, 'level', e.target.value)}
                        className="form-input"
                      >
                        {levelOptions.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Hours
                      </label>
                      <input
                        type="number"
                        value={path.estimatedHours}
                        onChange={(e) => updatePath(pathSlug, 'estimatedHours', parseInt(e.target.value))}
                        className="form-input"
                        placeholder="480"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="h-4 w-4 inline mr-1" />
                      Average Salary Range
                    </label>
                    <input
                      type="text"
                      value={path.averageSalary}
                      onChange={(e) => updatePath(pathSlug, 'averageSalary', e.target.value)}
                      className="form-input"
                      placeholder="e.g., ₹8-15 LPA"
                    />
                  </div>

                  {/* Course Progression */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Course Progression</h4>
                        <p className="text-sm text-gray-500">
                          {availableCourses.length > 0 
                            ? `${availableCourses.length} courses available for selection`
                            : 'No courses available - add courses first'
                          }
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          console.log('🖱️ Button click event triggered', e);
                          addCourseToPath(pathSlug);
                        }}
                        onMouseDown={() => console.log('🖱️ Button mouse down')}
                        className={`btn-outline btn-sm flex items-center gap-2 ${
                          availableCourses.length === 0 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                        disabled={availableCourses.length === 0}
                        title={availableCourses.length === 0 
                          ? 'No courses available. Add courses first in the Courses section.' 
                          : `Add course from ${availableCourses.length} available courses`
                        }
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                        Add Course ({availableCourses.length})
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {path.courses?.map((pathCourse, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
                            {pathCourse.order}
                          </div>
                          
                          <div className="flex-1 grid md:grid-cols-4 gap-3">
                            <select
                              value={pathCourse.courseSlug}
                              onChange={(e) => updatePathCourse(pathSlug, index, 'courseSlug', e.target.value)}
                              className="form-input text-sm"
                              title={`${availableCourses.length} courses available`}
                            >
                              <option value="">
                                {availableCourses.length > 0 
                                  ? `Select course... (${availableCourses.length} available)` 
                                  : 'No courses available - Add courses first'
                                }
                              </option>
                              {availableCourses.map(course => (
                                <option key={course.slug} value={course.slug}>
                                  📚 {course.title} {course.duration ? `(${course.duration})` : ''} {course.fees ? `- ${course.fees.split(' ')[0]}` : ''}
                                </option>
                              ))}
                            </select>
                            
                            <input
                              type="text"
                              value={pathCourse.duration}
                              onChange={(e) => updatePathCourse(pathSlug, index, 'duration', e.target.value)}
                              className="form-input"
                              placeholder="Duration"
                            />
                            
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={pathCourse.prerequisite}
                                onChange={(e) => updatePathCourse(pathSlug, index, 'prerequisite', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Prerequisite required</span>
                            </label>
                            
                            <div className="flex gap-1">
                              <button
                                onClick={() => movePathCourse(pathSlug, index, 'up')}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => movePathCourse(pathSlug, index, 'down')}
                                disabled={index === path.courses.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => removePathCourse(pathSlug, index)}
                                className="p-1 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!path.courses || path.courses.length === 0) && (
                        <div className="text-center py-8 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                          <Route className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium mb-2">No courses in this learning path yet</p>
                          <p className="text-sm text-gray-500">
                            {availableCourses.length > 0 
                              ? `Click "Add Course" to choose from ${availableCourses.length} available courses and start building the progression.`
                              : "Add courses in the Courses section first, then come back to build learning paths."
                            }
                          </p>
                          {availableCourses.length === 0 && (
                            <p className="text-xs text-red-500 mt-2">
                              ⚠️ No courses available in the system
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Learning Outcomes
                      </h4>
                      <button
                        onClick={() => addOutcome(pathSlug)}
                        className="btn-outline btn-sm flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Outcome
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {path.outcomes?.map((outcome, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={outcome}
                            onChange={(e) => updateOutcome(pathSlug, index, e.target.value)}
                            className="form-input flex-1"
                            placeholder="What will students learn/achieve?"
                          />
                          <button
                            onClick={() => removeOutcome(pathSlug, index)}
                            className="p-2 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Career Roles */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Career Roles
                      </h4>
                      <button
                        onClick={() => addCareerRole(pathSlug)}
                        className="btn-outline btn-sm flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Role
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {path.careerRoles?.map((role, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={role}
                            onChange={(e) => updateCareerRole(pathSlug, index, e.target.value)}
                            className="form-input flex-1"
                            placeholder="Job role title"
                          />
                          <button
                            onClick={() => removeCareerRole(pathSlug, index)}
                            className="p-2 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
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
                          value={path.seo?.title || ''}
                          onChange={(e) => updatePathSEO(pathSlug, 'title', e.target.value)}
                          className="form-input"
                          placeholder="SEO title for this learning path"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          value={path.seo?.description || ''}
                          onChange={(e) => updatePathSEO(pathSlug, 'description', e.target.value)}
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
                          value={path.seo?.keywords || ''}
                          onChange={(e) => updatePathSEO(pathSlug, 'keywords', e.target.value)}
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

export default LearningPathManager;