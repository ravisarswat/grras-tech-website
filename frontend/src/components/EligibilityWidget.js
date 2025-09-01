import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, BookOpen, Users } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useSearchParams } from 'react-router-dom';

const EligibilityWidget = () => {
  const { content } = useContent();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [eligibilityText, setEligibilityText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get visible courses ordered by their order field
  const availableCourses = (content?.courses || [])
    .filter(course => course.visible !== false)
    .sort((a, b) => (a.order || 999) - (b.order || 999));

  useEffect(() => {
    // Check for URL parameter to preselect course
    const courseParam = searchParams.get('course');
    console.log('URL course parameter:', courseParam);
    console.log('Available courses count:', availableCourses.length);
    
    if (courseParam && availableCourses.length > 0) {
      const course = availableCourses.find(c => c.slug === courseParam);
      console.log('Course found for URL param:', course);
      
      if (course) {
        setSelectedCourse(courseParam);
        handleCourseSelection(courseParam);
      } else {
        console.warn('Course not found for URL parameter:', courseParam);
        // Try to find a similar course by name matching
        const similarCourse = availableCourses.find(c => 
          c.title?.toLowerCase().includes('openshift') || 
          c.name?.toLowerCase().includes('openshift') ||
          c.slug?.includes('do188')
        );
        
        if (similarCourse) {
          console.log('Found similar course:', similarCourse);
          setSelectedCourse(similarCourse.slug);
          handleCourseSelection(similarCourse.slug);
        }
      }
    }
  }, [searchParams, availableCourses]);

  const handleCourseSelection = (courseSlug) => {
    if (!courseSlug) {
      setEligibilityText('');
      return;
    }

    setIsLoading(true);
    
    // Debug logging
    console.log('Selected course slug:', courseSlug);
    console.log('Available courses:', availableCourses.map(c => ({ slug: c.slug, title: c.title || c.name })));
    
    // Find the course
    const course = availableCourses.find(c => c.slug === courseSlug);
    console.log('Found course:', course);
    
    if (!course) {
      console.error('Course not found for slug:', courseSlug);
      setIsLoading(false);
      setEligibilityText('Course not found. Please contact our admission counselors for assistance.');
      return;
    }
    
    // Simulate loading for UX (since data is already available)
    setTimeout(() => {
      let eligibility = course.eligibility;
      
      // Enhanced fallback with more helpful information
      if (!eligibility || eligibility.trim() === '') {
        eligibility = `For ${course.title || course.name || 'this course'}, please contact our admission counselors for detailed eligibility criteria and personalized guidance. Our team will help you determine if you meet the requirements and guide you through the admission process.`;
      }
      
      setEligibilityText(eligibility);
      
      // Update URL parameter
      const newParams = new URLSearchParams(searchParams);
      newParams.set('course', courseSlug);
      setSearchParams(newParams);
      setIsLoading(false);
    }, 800); // Reduced timeout for better UX
  };

  const resetWidget = () => {
    setSelectedCourse('');
    setEligibilityText('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('course');
    setSearchParams(newParams);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      {/* Widget Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <CheckCircle className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Check Your Eligibility</h3>
          <p className="text-sm text-gray-600">Find out if you meet the requirements for your chosen course</p>
        </div>
      </div>

      {/* Course Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              handleCourseSelection(e.target.value);
            }}
            className="w-full form-input"
          >
            <option value="">Choose a course...</option>
            {availableCourses.map((course) => (
              <option key={course.slug} value={course.slug}>
                {course.title || course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Checking eligibility...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">Unable to Check Eligibility</h4>
                <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    resetWidget();
                  }}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Eligibility Result */}
        {eligibilityText && !isLoading && !error && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Eligibility Requirements</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{eligibilityText}</p>
                
                {/* Course Details */}
                {selectedCourse && (
                  <div className="mt-4 pt-3 border-t border-green-200">
                    {(() => {
                      const course = availableCourses.find(c => c.slug === selectedCourse);
                      return (
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                          {course?.duration && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>Duration: {course.duration}</span>
                            </div>
                          )}
                          {course?.level && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>Level: {course.level}</span>
                            </div>
                          )}
                          {course?.fees && (
                            <div className="flex items-center gap-1">
                              <span>💰</span>
                              <span>Fees: {course.fees}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-4 pt-3 border-t border-green-200">
              <button
                onClick={() => {
                  const course = availableCourses.find(c => c.slug === selectedCourse);
                  if (course) {
                    window.open(`/courses/${course.slug}`, '_blank');
                  }
                }}
                className="btn-primary text-sm px-4 py-2"
              >
                View Course Details
              </button>
              
              <button
                onClick={resetWidget}
                className="btn-outline text-sm px-4 py-2"
              >
                Check Another Course
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedCourse && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm">Select a course to check eligibility requirements</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Need personalized guidance? 
          <a 
            href="/contact" 
            className="text-red-600 hover:text-red-700 ml-1 font-medium"
          >
            Contact our counselors
          </a>
        </p>
      </div>
    </div>
  );
};

export default EligibilityWidget;