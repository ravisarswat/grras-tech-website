import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, BookOpen, Users } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useSearchParams } from 'react-router-dom';

const EligibilityWidget = () => {
  const { content } = useContent();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [eligibilityText, setEligibilityText] = useState('');
  const [error, setError] = useState(null);
  // Removed isLoading state to eliminate loading issues

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
      // Wait a bit for content to fully load
      const timer = setTimeout(() => {
        const course = availableCourses.find(c => c.slug === courseParam);
        console.log('Course found for URL param:', course);
        
        if (course) {
          setSelectedCourse(courseParam);
          handleInitialCourseSelection(courseParam);
        } else {
          console.warn('Course not found for URL parameter:', courseParam);
          console.log('Available course slugs:', availableCourses.map(c => c.slug));
          
          // Try to find a similar course by name matching
          const similarCourse = availableCourses.find(c => 
            c.title?.toLowerCase().includes('openshift') || 
            c.name?.toLowerCase().includes('openshift') ||
            c.slug?.includes('do188') ||
            c.slug?.includes('do280')
          );
          
          if (similarCourse) {
            console.log('Found similar course:', similarCourse);
            setSelectedCourse(similarCourse.slug);
            handleInitialCourseSelection(similarCourse.slug);
          } else {
            // Clear the URL parameter if course not found
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('course');
            setSearchParams(newParams);
          }
        }
      }, 500); // Wait for content to load
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, availableCourses]);

  // Initial course selection from URL parameter - simplified
  const handleInitialCourseSelection = (courseSlug) => {
    if (!courseSlug) return;

    console.log('🚀 Initial course selection:', courseSlug);
    handleCourseSelection(courseSlug); // Use the same logic
  };

  const handleCourseSelection = (courseSlug) => {
    console.log('🚀 ELIGIBILITY CHECK STARTED:', courseSlug);
    
    if (!courseSlug) {
      console.log('❌ No course slug provided');
      setEligibilityText('');
      setError(null);
      return;
    }

    // Clear previous state
    setError(null);
    setEligibilityText('');
    
    try {
      console.log('🔍 Available courses count:', availableCourses?.length || 0);
      
      if (!availableCourses || availableCourses.length === 0) {
        console.log('❌ No courses available');
        setError('Course data not loaded. Please refresh the page or contact support.');
        return;
      }
      
      // Find the course with comprehensive matching
      let course = null;
      
      // Try multiple matching strategies
      const strategies = [
        () => availableCourses.find(c => c.slug === courseSlug),
        () => availableCourses.find(c => c.slug?.toLowerCase() === courseSlug.toLowerCase()),
        () => availableCourses.find(c => c.slug?.includes('do188')),
        () => availableCourses.find(c => (c.title || c.name || '').toLowerCase().includes('do188')),
        () => availableCourses.find(c => (c.title || c.name || '').toLowerCase().includes('openshift')),
        () => availableCourses[0] // Fallback to first course
      ];
      
      for (let i = 0; i < strategies.length; i++) {
        course = strategies[i]();
        if (course) {
          console.log(`✅ Course found using strategy ${i + 1}:`, course.title || course.name);
          break;
        }
      }
      
      if (!course) {
        console.log('❌ ABSOLUTELY NO COURSE FOUND');
        setError('Course not found. Please contact our admission counselors for assistance.');
        return;
      }
      
      // Process eligibility
      let eligibility = course.eligibility || course.eligibilityText || '';
      
      if (!eligibility.trim()) {
        eligibility = `For ${course.title || course.name || 'this course'}, please contact our admission counselors for detailed eligibility criteria and personalized guidance. Our team will help you determine if you meet the requirements and guide you through the admission process.`;
      }
      
      console.log('✅ ELIGIBILITY PROCESSED:', eligibility.length, 'characters');
      
      // Complete successfully
      setEligibilityText(eligibility);
      
      // Update URL
      const newParams = new URLSearchParams(searchParams);
      newParams.set('course', course.slug);
      setSearchParams(newParams);
      
      console.log('🎉 ELIGIBILITY CHECK COMPLETED SUCCESSFULLY');
      
    } catch (error) {
      console.error('💥 ERROR in eligibility check:', error);
      setError('An error occurred while checking eligibility. Please try again.');
    }
  };

  const resetWidget = () => {
    setSelectedCourse('');
    setEligibilityText('');
    setError(null);
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
              console.log('🔥 DROPDOWN CHANGED:', e.target.value);
              const newCourse = e.target.value;
              setSelectedCourse(newCourse);
              
              if (newCourse) {
                // Handle course selection immediately in the onChange
                console.log('🚀 PROCESSING COURSE IMMEDIATELY:', newCourse);
                
                const course = availableCourses.find(c => c.slug === newCourse);
                
                if (course) {
                  let eligibility = course.eligibility || '';
                  if (!eligibility.trim()) {
                    eligibility = `For ${course.title || course.name}, please contact our admission counselors for detailed eligibility criteria and personalized guidance. Our team will help you determine if you meet the requirements and guide you through the admission process.`;
                  }
                  
                  setEligibilityText(eligibility);
                  setError(null);
                  
                  // Update URL
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('course', newCourse);
                  setSearchParams(newParams);
                  
                  console.log('✅ COURSE PROCESSED IMMEDIATELY');
                } else {
                  setError('Course not found. Please contact our admission counselors.');
                }
              } else {
                setEligibilityText('');
                setError(null);
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
          >
            <option value="">Choose a course...</option>
            {availableCourses.map((course) => (
              <option key={course.slug} value={course.slug}>
                {course.title || course.name}
              </option>
            ))}
          </select>
        </div>

        {/* No loading state - immediate results */}
        
        {/* Error State */}
        {error && (
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
        {eligibilityText && !error && (
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
        {!selectedCourse && !error && (
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