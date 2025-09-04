import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  Award, 
  BookOpen, 
  Download, 
  ArrowLeft,
  CheckCircle,
  Star,
  Target,
  Briefcase,
  Info
} from 'lucide-react';
import SEO, { CoursePageSEO } from '../components/SEO';
import EnhancedSyllabusDownload from '../components/EnhancedSyllabusDownload';
import { courses } from '../data/courses';

const CourseDetail = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEnhancedSyllabus, setShowEnhancedSyllabus] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [slug]);

  const fetchCourseDetails = () => {
    try {
      // Find course in static data
      const foundCourse = courses.find(c => c.slug === slug);
      
      if (!foundCourse) {
        setError('Course not found');
        setLoading(false);
        return;
      }
      
      // Prepare course data with defaults
      const courseWithDefaults = {
        ...foundCourse,
        // Ensure arrays exist
        highlights: foundCourse.highlights || [],
        learningOutcomes: foundCourse.learningOutcomes || [],
        careerRoles: foundCourse.careerRoles || [],
        tools: foundCourse.tools || [],
        mode: Array.isArray(foundCourse.mode) ? foundCourse.mode : foundCourse.mode ? foundCourse.mode.split(', ') : [],
        // Set defaults for missing optional fields
        overview: foundCourse.overview || foundCourse.description || '',
        certificateInfo: foundCourse.certificateInfo || '',
        batchesInfo: foundCourse.batchesInfo || '',
        eligibility: foundCourse.eligibility || 'Contact for details',
        level: foundCourse.level || 'All Levels',
        category: foundCourse.category || 'Training',
        fees: foundCourse.fees || foundCourse.price || 'Contact for Details'
      };
      
      setCourse(courseWithDefaults);
    } catch (error) {
      console.error('Error loading course:', error);
      setError('Course not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses" className="btn-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <CoursePageSEO course={course} tools={course.tools || []} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className={`py-20 bg-gradient-to-br ${course.color || 'from-red-500 to-pink-600'} text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Course Info */}
              <div className="animate-fade-in-up">
                <Link 
                  to={course.categories && course.categories.length > 0 
                    ? `/courses?tab=${course.categories[0]}` 
                    : "/courses"
                  }
                  className="inline-flex items-center text-white hover:text-gray-200 mb-6 transition-colors group"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span>Back to {course.categories && course.categories.length > 0 ? `${course.categories[0].charAt(0).toUpperCase() + course.categories[0].slice(1)} Courses` : 'All Courses'}</span>
                </Link>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-6xl">{course.icon || '📚'}</div>
                  <div>
                    <span className="text-lg font-medium opacity-90">{course.category || 'Training'}</span>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {course.title || course.name}
                </h1>
                
                <p className="text-xl text-gray-100 mb-6">
                  {course.oneLiner || course.tagline}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm mb-8">
                  {course.duration && (
                    <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  
                  {course.level && (
                    <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                      <Users className="h-4 w-4" />
                      <span>{course.level}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                    <Award className="h-4 w-4" />
                    <span>Certificate Included</span>
                  </div>
                </div>
              </div>
              
              {/* CTA Card */}
              <div className="animate-fade-in-right">
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Download Detailed Syllabus
                    </h3>
                    <p className="text-gray-600">
                      Get complete curriculum, tools, and course structure
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setShowEnhancedSyllabus(true)}
                    className="btn-primary w-full text-center mb-4"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Syllabus (PDF)
                  </button>
                  
                  <div className="text-center text-sm text-gray-500 mb-4">
                    Free download • No spam • Instant access
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-600 font-medium">Course Fee:</span>
                      <span className="font-semibold text-gray-900 text-right">
                        {course.fees || 'Contact for Details'}
                      </span>
                    </div>
                    
                    {course.batchesInfo && (
                      <div className="flex justify-between items-start text-sm">
                        <span className="text-gray-600 font-medium">Batches:</span>
                        <span className="font-semibold text-gray-900 text-right max-w-xs">
                          {course.batchesInfo.split('\n')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Details */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Description/Overview */}
                {course.overview && (
                  <div className="bg-white rounded-xl p-8 shadow-lg mb-8 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Course Overview
                    </h2>
                    <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                      {course.overview}
                    </div>
                  </div>
                )}

                {/* Tools & Technologies */}
                {course.tools && course.tools.length > 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-lg mb-8 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Tools & Technologies You'll Master
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {course.tools.map((tool, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700 font-medium">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Outcomes */}
                {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-lg mb-8 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      What You'll Learn
                    </h2>
                    <div className="space-y-3">
                      {course.learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Target className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Career Opportunities */}
                {course.careerRoles && course.careerRoles.length > 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-lg mb-8 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Career Opportunities
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.careerRoles.map((career, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg"
                        >
                          <Briefcase className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700 font-medium">{career}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificate Information */}
                {course.certificateInfo && (
                  <div className="bg-white rounded-xl p-8 shadow-lg mb-8 animate-fade-in-up">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">🎓</div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-3">
                            Certificate of Completion
                          </h2>
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {course.certificateInfo}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Batch Information */}
                {course.batchesInfo && (
                  <div className="bg-white rounded-xl p-8 shadow-lg animate-fade-in-up">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">📅</div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-3">
                            Batch Information
                          </h2>
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {course.batchesInfo}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Course Highlights */}
                {course.highlights && course.highlights.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Course Highlights
                    </h3>
                    <div className="space-y-3">
                      {course.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm leading-relaxed">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Details */}
                <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    Course Details
                  </h3>
                  <div className="space-y-4">
                    {course.level && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">Level:</span>
                        <span className="font-medium text-gray-900 text-right">{course.level}</span>
                      </div>
                    )}
                    
                    {course.mode && course.mode.length > 0 && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">Mode:</span>
                        <span className="font-medium text-gray-900 text-right">{course.mode.join(', ')}</span>
                      </div>
                    )}
                    
                    {course.eligibility && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">Eligibility:</span>
                        <span className="font-medium text-gray-900 text-right max-w-xs">{course.eligibility}</span>
                      </div>
                    )}
                    
                    {course.category && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">Category:</span>
                        <span className="font-medium text-gray-900 text-right capitalize">{course.category}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-red-500" />
                    Get Started Today
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowEnhancedSyllabus(true)}
                      className="btn-primary w-full text-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Syllabus
                    </button>
                    
                    <Link
                      to="/admissions"
                      className="btn-secondary w-full text-center"
                    >
                      Apply for Admission
                    </Link>
                    
                    <Link
                      to="/contact"
                      className="btn-outline w-full text-center"
                    >
                      Talk to Counselor
                    </Link>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Need More Information?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Speak with our admission counselors for personalized guidance.
                  </p>
                  <div className="space-y-2">
                    <a 
                      href="tel:+919001991227"
                      className="block text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      📞 090019 91227
                    </a>
                    <a 
                      href="https://wa.me/919001991227"
                      className="block text-sm text-green-600 hover:text-green-700 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 WhatsApp Chat
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Syllabus Modal */}
      <SyllabusModal
        isOpen={showEnhancedSyllabus}
        onClose={() => setShowEnhancedSyllabus(false)}
        courseSlug={course.slug}
        courseName={course.title || course.name || 'Course'}
      />
    </>
  );
};

export default CourseDetail;