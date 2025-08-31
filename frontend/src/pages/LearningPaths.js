import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Route, 
  ArrowRight, 
  Clock, 
  User, 
  Star,
  CheckCircle,
  Briefcase,
  TrendingUp,
  Award,
  PlayCircle,
  Search,
  Filter,
  Target
} from 'lucide-react';
import SEO from '../components/SEO';
import { useContent } from '../contexts/ContentContext';

const LearningPaths = () => {
  const { content } = useContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  
  // Debug logging
  console.log('LearningPaths Debug:', {
    content: content,
    learningPaths: content?.learningPaths,
    learningPathsKeys: content?.learningPaths ? Object.keys(content.learningPaths) : 'undefined'
  });
  
  const learningPaths = content?.learningPaths || {};
  const courses = content?.courses || [];

  // Filter and sort learning paths
  const filteredPaths = Object.entries(learningPaths)
    .filter(([_, path]) => {
      // Search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          path.title?.toLowerCase().includes(searchLower) ||
          path.description?.toLowerCase().includes(searchLower) ||
          path.careerRoles?.some(role => role.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Level filter
      if (selectedLevel !== 'all') {
        if (!path.level?.toLowerCase().includes(selectedLevel.toLowerCase())) return false;
      }

      return true;
    })
    .sort(([_, a], [__, b]) => {
      switch (sortBy) {
        case 'popular':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'duration':
          return (a.estimatedHours || 0) - (b.estimatedHours || 0);
        default:
          return 0;
      }
    });

  const levels = ['all', 'beginner', 'intermediate', 'advanced'];
  const sortOptions = [
    { id: 'popular', name: 'Most Popular' },
    { id: 'name', name: 'Name (A-Z)' },
    { id: 'duration', name: 'Duration' }
  ];

  return (
    <>
      <SEO
        title="Learning Paths - Structured Career Training - GRRAS Solutions"
        description="Follow structured learning paths designed for specific career goals. Cloud Engineer, DevOps Specialist, and more career-focused training programs."
        keywords="learning paths, career training, structured courses, IT career paths, professional development"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full"></div>
            <div className="absolute top-40 right-32 w-24 h-24 border border-white rounded-full"></div>
            <div className="absolute bottom-32 left-40 w-16 h-16 border border-white rounded-full"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-green-500 bg-opacity-20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Route className="h-4 w-4" />
                Structured Learning Journeys
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Career-Focused Learning Paths
              </h1>
              
              <p className="text-xl text-gray-100 mb-8 max-w-4xl mx-auto leading-relaxed">
                Follow expertly designed learning journeys that combine multiple courses into 
                comprehensive career tracks with step-by-step progression and industry-aligned skills.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{Object.keys(learningPaths).length}</div>
                  <div className="text-sm text-gray-200">Learning Paths</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">500+</div>
                  <div className="text-sm text-gray-200">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">95%</div>
                  <div className="text-sm text-gray-200">Job Placement</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">₹8-15L</div>
                  <div className="text-sm text-gray-200">Avg Salary</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/admissions" className="btn-white inline-flex items-center justify-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Start Your Journey
                </Link>
                <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-gray-900 inline-flex items-center justify-center gap-2">
                  Get Career Guidance
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search learning paths..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-4">
                {/* Level Filter */}
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Paths Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredPaths.length === 0 ? (
              <div className="text-center py-16">
                <Route className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No learning paths found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters to find more learning paths.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedLevel('all');
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-8">
                {filteredPaths.map(([pathSlug, path]) => (
                  <LearningPathCard 
                    key={pathSlug} 
                    pathSlug={pathSlug} 
                    path={path} 
                    courses={courses}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Learning Paths */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Follow a Learning Path?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Structured learning journeys provide clear roadmaps to specific career goals with optimized course sequencing.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Route className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Structured Progression</h3>
                <p className="text-gray-600">
                  Follow a carefully designed sequence that builds skills systematically from basics to advanced levels.
                </p>
              </div>
              
              <div className="text-center p-8 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Career-Focused</h3>
                <p className="text-gray-600">
                  Each path is designed for specific career outcomes with industry-relevant skills and certifications.
                </p>
              </div>
              
              <div className="text-center p-8 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Proven Success</h3>
                <p className="text-gray-600">
                  High placement rates and career advancement for students who complete our learning paths.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Choose a learning path that aligns with your career goals and start your journey to professional success.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admissions" className="btn-primary">
                Start Your Learning Path
              </Link>
              <Link to="/contact" className="btn-outline border-gray-400 text-gray-300 hover:bg-gray-800">
                Talk to Career Counselor
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

// Learning Path Card Component
const LearningPathCard = ({ pathSlug, path, courses }) => {
  // Get courses in the learning path
  const pathCourses = path.courses?.map(pathCourse => {
    const course = courses.find(c => c.slug === pathCourse.courseSlug);
    return course ? { ...course, ...pathCourse } : null;
  }).filter(Boolean) || [];

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="p-8">
        {/* Path Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-xl flex items-center justify-center">
              <Route className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                {path.title}
              </h3>
              {path.featured && (
                <div className="flex items-center gap-1 text-yellow-600 text-sm">
                  <Star className="h-3 w-3 fill-current" />
                  <span>Most Popular</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Path Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {path.description}
        </p>

        {/* Path Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-gray-900 font-semibold">{path.duration}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Level</span>
            </div>
            <p className="text-gray-900 font-semibold">{path.level}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Courses</span>
            </div>
            <p className="text-gray-900 font-semibold">{path.totalCourses || pathCourses.length}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm font-medium">Salary</span>
            </div>
            <p className="text-gray-900 font-semibold text-sm">{path.averageSalary}</p>
          </div>
        </div>

        {/* Course Progression Preview */}
        {pathCourses.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Learning Journey:</h4>
            <div className="space-y-2">
              {pathCourses.slice(0, 3).map((course, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">
                    {course.order || index + 1}
                  </div>
                  <span className="text-gray-600 text-sm">{course.title}</span>
                  {course.prerequisite && (
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                      Prereq
                    </span>
                  )}
                </div>
              ))}
              {pathCourses.length > 3 && (
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center text-xs">
                    +{pathCourses.length - 3}
                  </div>
                  <span className="text-sm">more courses</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Career Outcomes Preview */}
        {path.careerRoles && path.careerRoles.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Career Opportunities:</h4>
            <div className="flex flex-wrap gap-2">
              {path.careerRoles.slice(0, 3).map((role, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full"
                >
                  {role}
                </span>
              ))}
              {path.careerRoles.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  +{path.careerRoles.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link
          to={`/learning-paths/${pathSlug}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-medium hover:from-green-500 hover:to-blue-500 transition-all duration-300 group/btn"
        >
          <PlayCircle className="h-5 w-5" />
          Start Learning Path
          <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default LearningPaths;