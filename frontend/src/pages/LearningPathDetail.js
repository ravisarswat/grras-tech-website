import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Route, 
  ArrowRight, 
  Clock, 
  User, 
  CheckCircle,
  Star,
  Target,
  Briefcase,
  TrendingUp,
  Award,
  BookOpen,
  PlayCircle,
  Download,
  Users,
  Calendar
} from 'lucide-react';
import SEO from '../components/SEO';
import { useContent } from '../contexts/ContentContext';

const LearningPathDetail = () => {
  const { pathSlug } = useParams();
  const { content } = useContent();
  const [activeTab, setActiveTab] = useState('overview');
  
  const learningPaths = content?.learningPaths || {};
  const courses = content?.courses || [];
  
  const learningPath = learningPaths[pathSlug];

  if (!learningPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Route className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Path Not Found</h2>
          <p className="text-gray-600 mb-6">The requested learning path could not be found.</p>
          <Link to="/learning-paths" className="btn-primary">
            Browse All Learning Paths
          </Link>
        </div>
      </div>
    );
  }

  // Get courses in the learning path
  const pathCourses = learningPath.courses?.map(pathCourse => {
    const course = courses.find(c => c.slug === pathCourse.courseSlug);
    return course ? { ...course, ...pathCourse } : null;
  }).filter(Boolean) || [];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BookOpen },
    { id: 'curriculum', name: 'Curriculum', icon: Route },
    { id: 'outcomes', name: 'Outcomes', icon: Target },
    { id: 'careers', name: 'Careers', icon: Briefcase }
  ];

  return (
    <>
      <SEO
        title={learningPath.seo?.title || `${learningPath.title} - GRRAS Solutions`}
        description={learningPath.seo?.description || learningPath.description}
        keywords={learningPath.seo?.keywords || `${learningPath.title}, learning path, career training`}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full"></div>
            <div className="absolute top-32 right-20 w-24 h-24 border border-white rounded-full"></div>
            <div className="absolute bottom-20 left-32 w-16 h-16 border border-white rounded-full"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Content */}
              <div className="animate-fade-in-up text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-green-500 bg-opacity-20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Route className="h-4 w-4" />
                  Structured Learning Journey
                  {learningPath.featured && (
                    <>
                      <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                      <Star className="h-3 w-3 fill-current" />
                      <span>Most Popular</span>
                    </>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-6">
                  {learningPath.title}
                </h1>
                
                <p className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed">
                  {learningPath.description}
                </p>

                {/* Path Stats - Mobile Optimized */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                  <div className="text-center bg-white bg-opacity-10 rounded-xl p-3 md:p-4">
                    <div className="text-xl md:text-2xl font-bold mb-1">{learningPath.totalCourses || pathCourses.length}</div>
                    <div className="text-xs md:text-sm text-gray-200">Courses</div>
                  </div>
                  <div className="text-center bg-white bg-opacity-10 rounded-xl p-3 md:p-4">
                    <div className="text-xl md:text-2xl font-bold mb-1">{learningPath.duration}</div>
                    <div className="text-xs md:text-sm text-gray-200">Duration</div>
                  </div>
                  <div className="text-center bg-white bg-opacity-10 rounded-xl p-3 md:p-4">
                    <div className="text-xl md:text-2xl font-bold mb-1">{learningPath.estimatedHours || 400}+</div>
                    <div className="text-xs md:text-sm text-gray-200">Hours</div>
                  </div>
                  <div className="text-center bg-white bg-opacity-10 rounded-xl p-3 md:p-4">
                    <div className="text-xl md:text-2xl font-bold mb-1">{learningPath.averageSalary}</div>
                    <div className="text-xs md:text-sm text-gray-200">Avg Salary</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/admissions" className="btn-white inline-flex items-center justify-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Start Learning Path
                  </Link>
                  <button className="btn-outline border-white text-white hover:bg-white hover:text-gray-900 inline-flex items-center justify-center gap-2">
                    <Download className="h-5 w-5" />
                    Download Curriculum
                  </button>
                </div>
              </div>

              {/* Path Info Card */}
              <div className="animate-fade-in-right">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white border-opacity-20">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-6 text-center lg:text-left">Path Highlights</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 bg-white bg-opacity-10 rounded-lg p-3">
                      <Clock className="h-5 w-5 text-blue-400 shrink-0" />
                      <div>
                        <div className="text-white font-medium">Duration</div>
                        <div className="text-gray-300 text-sm">{learningPath.duration}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white bg-opacity-10 rounded-lg p-3">
                      <User className="h-5 w-5 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-white font-medium">Skill Level</div>
                        <div className="text-gray-300 text-sm">{learningPath.level}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white bg-opacity-10 rounded-lg p-3">
                      <Award className="h-5 w-5 text-yellow-400 shrink-0" />
                      <div>
                        <div className="text-white font-medium">Certifications</div>
                        <div className="text-gray-300 text-sm">Industry-recognized</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white bg-opacity-10 rounded-lg p-3">
                      <Users className="h-5 w-5 text-green-400 shrink-0" />
                      <div>
                        <div className="text-white font-medium">Support</div>
                        <div className="text-gray-300 text-sm">Mentorship & Placement</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black bg-opacity-20 rounded-xl p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">95%</div>
                    <div className="text-gray-300 text-sm">Job Placement Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="bg-white border-b sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-2 md:space-x-8 overflow-x-auto py-4 scrollbar-hide">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm md:text-base">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="py-8 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8 md:space-y-12">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center lg:text-left">Learning Path Overview</h2>
                  <div className="prose prose-lg max-w-4xl mx-auto lg:mx-0">
                    <p className="text-gray-600 leading-relaxed text-center lg:text-left">
                      {learningPath.description}
                    </p>
                  </div>
                </div>

                {/* Why This Path - Mobile Optimized */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  <div className="text-center p-6 md:p-8 bg-white rounded-2xl shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">High-Growth Field</h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      Enter one of the fastest-growing technology sectors with excellent career prospects.
                    </p>
                  </div>
                  
                  <div className="text-center p-6 md:p-8 bg-white rounded-2xl shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Route className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Structured Learning</h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      Follow a carefully designed progression that builds skills systematically.
                    </p>
                  </div>
                  
                  <div className="text-center p-6 md:p-8 bg-white rounded-2xl shadow-lg">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Industry Recognition</h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      Gain certifications and skills that are highly valued by employers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Course Progression</h2>
                
                {pathCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <Route className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses configured</h3>
                    <p className="text-gray-600">The curriculum for this learning path is being updated.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pathCourses.map((course, index) => (
                      <div key={course.slug} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-4 md:p-8">
                          {/* Mobile-First Layout */}
                          <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6">
                            {/* Course Number */}
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 mx-auto lg:mx-0">
                              {course.order || index + 1}
                            </div>
                            
                            {/* Course Info */}
                            <div className="flex-1 w-full">
                              {/* Mobile Course Header */}
                              <div className="text-center lg:text-left mb-4">
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
                                <p className="text-gray-600 mb-4 text-sm md:text-base">{course.oneLiner}</p>
                              </div>
                              
                              {/* Course Details - Mobile Stacked */}
                              <div className="space-y-4 mb-4">
                                {/* Course Meta Info */}
                                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg">
                                    <Clock className="h-4 w-4" />
                                    <span>{course.duration}</span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg">
                                    <User className="h-4 w-4" />
                                    <span>{course.level}</span>
                                  </div>
                                  {course.prerequisite && (
                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-xs">
                                      Prerequisite Required
                                    </span>
                                  )}
                                </div>
                                
                                {/* Price and Action - Mobile Centered */}
                                <div className="text-center lg:text-right">
                                  <p className="text-2xl md:text-3xl font-bold text-red-600 mb-3">{course.fees}</p>
                                  <Link
                                    to={`/courses/${course.slug}`}
                                    className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                                  >
                                    View Course
                                    <ArrowRight className="h-4 w-4" />
                                  </Link>
                                </div>
                              </div>
                              
                              {/* Course Highlights - Mobile Optimized */}
                              {course.highlights && course.highlights.length > 0 && (
                                <div className="border-t border-gray-100 pt-4">
                                  <h4 className="font-semibold text-gray-900 mb-3 text-center lg:text-left">What You'll Learn:</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {course.highlights.slice(0, 4).map((highlight, idx) => (
                                      <div key={idx} className="flex items-start gap-3 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">{highlight}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Arrow - Mobile Centered */}
                        {index < pathCourses.length - 1 && (
                          <div className="flex justify-center pb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm">
                              <ArrowRight className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Path Completion Summary */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 border border-green-100">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Path Completion</h3>
                        <p className="text-gray-600 mb-4">
                          Upon completing all courses, you'll receive industry-recognized certifications and comprehensive placement support.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Link to="/admissions" className="btn-primary">
                            Start Your Journey
                          </Link>
                          <button className="btn-outline">
                            Download Full Syllabus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Outcomes Tab */}
            {activeTab === 'outcomes' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Learning Outcomes</h2>
                
                {learningPath.outcomes && learningPath.outcomes.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {learningPath.outcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-gray-700 leading-relaxed">{outcome}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 mb-12">
                    <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Learning outcomes are being updated for this path.</p>
                  </div>
                )}

                {/* Skills You'll Gain */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Skills You'll Master</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {pathCourses.flatMap(course => course.tools || [])
                      .filter((tool, index, array) => array.indexOf(tool) === index)
                      .slice(0, 12)
                      .map((skill, index) => (
                        <div key={index} className="bg-white px-4 py-2 rounded-lg text-center font-medium text-gray-700">
                          {skill}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Careers Tab */}
            {activeTab === 'careers' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Career Opportunities</h2>
                
                {learningPath.careerRoles && learningPath.careerRoles.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {learningPath.careerRoles.map((role, index) => (
                      <div key={index} className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Briefcase className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{role}</h3>
                        <p className="text-gray-600 mb-4">High-demand role with excellent growth prospects</p>
                        <div className="text-2xl font-bold text-green-600">{learningPath.averageSalary}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 mb-12">
                    <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Career information is being updated for this path.</p>
                  </div>
                )}

                {/* Success Stats */}
                <div className="bg-gray-900 text-white rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-8 text-center">Success Statistics</h3>
                  <div className="grid md:grid-cols-4 gap-8 text-center">
                    <div>
                      <div className="text-3xl font-bold text-green-400 mb-2">95%</div>
                      <div className="text-gray-300">Job Placement Rate</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-400 mb-2">40%</div>
                      <div className="text-gray-300">Average Salary Increase</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-400 mb-2">6</div>
                      <div className="text-gray-300">Months Average Time</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
                      <div className="text-gray-300">Successful Graduates</div>    
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-red-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
              Join the {learningPath.title} and transform your career with industry-relevant skills and expert guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admissions" className="btn-white">
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Learning Path
              </Link>
              <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-red-600">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Consultation
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LearningPathDetail;