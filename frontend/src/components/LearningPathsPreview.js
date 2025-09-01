import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Route, 
  Clock, 
  User, 
  ArrowRight, 
  CheckCircle,
  Briefcase,
  TrendingUp,
  Star
} from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

const LearningPathsPreview = () => {
  const { content } = useContent();
  const learningPaths = content?.learningPaths || {};

  // Get featured learning paths
  const featuredPaths = Object.entries(learningPaths)
    .filter(([_, path]) => path.featured)
    .slice(0, 3);

  if (featuredPaths.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-green-500 bg-opacity-20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Route className="h-4 w-4" />
            Guided Learning Journeys
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Structured Career Paths
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Follow our expertly designed learning paths to master specific career tracks with 
            step-by-step course progression and industry-aligned skills
          </p>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {featuredPaths.map(([pathSlug, path]) => (
            <div
              key={pathSlug}
              className="group relative bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300"
            >
              {/* Path Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Route className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                      {path.title}
                    </h3>
                    {path.featured && (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Star className="h-3 w-3 fill-current" />
                        <span>Most Popular</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Path Description */}
              <p className="text-gray-300 mb-6 leading-relaxed">
                {path.description}
              </p>

              {/* Path Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black bg-opacity-20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Duration</span>
                  </div>
                  <p className="text-white font-semibold">{path.duration}</p>
                </div>
                
                <div className="bg-black bg-opacity-20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-400 mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Level</span>
                  </div>
                  <p className="text-white font-semibold">{path.level}</p>
                </div>

                <div className="bg-black bg-opacity-20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-400 mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Courses</span>
                  </div>
                  <p className="text-white font-semibold">{path.totalCourses || path.courses?.length || 0}</p>
                </div>

                <div className="bg-black bg-opacity-20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm font-medium">Salary</span>
                  </div>
                  <p className="text-white font-semibold text-sm">{path.averageSalary}</p>
                </div>
              </div>

              {/* Course Progression Preview */}
              {path.courses && path.courses.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Course Progression:</h4>
                  <div className="space-y-2">
                    {path.courses.slice(0, 3).map((course, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center text-green-400 text-xs font-bold">
                          {course.order || index + 1}
                        </div>
                        <span className="text-gray-300 text-sm">{course.title}</span>
                        {course.prerequisite && (
                          <span className="text-xs bg-yellow-500 bg-opacity-20 text-yellow-400 px-2 py-1 rounded">
                            Prereq
                          </span>
                        )}
                      </div>
                    ))}
                    {path.courses.length > 3 && (
                      <div className="flex items-center gap-3 text-gray-400">
                        <div className="w-6 h-6 border border-gray-500 rounded-full flex items-center justify-center text-xs">
                          +{path.courses.length - 3}
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
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Career Opportunities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {path.careerRoles.slice(0, 2).map((role, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-500 bg-opacity-20 text-blue-400 px-3 py-1 rounded-full"
                      >
                        {role}
                      </span>
                    ))}
                    {path.careerRoles.length > 2 && (
                      <span className="text-xs bg-gray-500 bg-opacity-20 text-gray-400 px-3 py-1 rounded-full">
                        +{path.careerRoles.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* View Path Link */}
              <Link
                to={`/learning-paths/${pathSlug}`}
                className="group/link inline-flex items-center justify-between w-full p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white font-medium hover:from-green-400 hover:to-blue-400 transition-all duration-300"
              >
                <span>Start Learning Path</span>
                <ArrowRight className="h-5 w-5 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        {/* View All Paths Link */}
        <div className="text-center">
          <Link
            to="/learning-paths"
            className="inline-flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-medium hover:bg-opacity-20 transition-all duration-300 border border-white border-opacity-20"
          >
            <Route className="h-5 w-5" />
            Explore All Learning Paths
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LearningPathsPreview;