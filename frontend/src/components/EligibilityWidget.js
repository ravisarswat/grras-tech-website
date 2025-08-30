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

  // Get visible courses ordered by their order field
  const availableCourses = (content?.courses || [])
    .filter(course => course.visible !== false)
    .sort((a, b) => (a.order || 999) - (b.order || 999));

  useEffect(() => {
    // Check for URL parameter to preselect course
    const courseParam = searchParams.get('course');
    if (courseParam && availableCourses.length > 0) {
      const course = availableCourses.find(c => c.slug === courseParam);
      if (course) {
        setSelectedCourse(courseParam);
        handleCourseSelection(courseParam);
      }
    }
  }, [searchParams, availableCourses]);

  const handleCourseSelection = (courseSlug) => {
    if (!courseSlug) {
      setEligibilityText('');
      return;
    }

    setIsLoading(true);
    
    // Simulate loading for UX (since data is already available)
    setTimeout(() => {
      const course = availableCourses.find(c => c.slug === courseSlug);
      if (course) {
        const eligibility = course.eligibility || 'Please contact our counselors for detailed eligibility criteria and guidance.';
        setEligibilityText(eligibility);
        
        // Update URL parameter
        const newParams = new URLSearchParams(searchParams);
        newParams.set('course', courseSlug);
        setSearchParams(newParams);
      }
      setIsLoading(false);
    }, 300);
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

        {/* Eligibility Result */}
        {eligibilityText && !isLoading && (
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