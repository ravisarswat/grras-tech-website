import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Star,
  ArrowRight,
} from 'lucide-react';

import { categories } from '../data/categories';
import { courses } from '../data/courses';

const MobileCourseCategories = () => {
  const [expanded, setExpanded] = useState(new Set(['red-hat-technologies']));

  // Featured categories + correct course counts (array-based)
  const featured = Object.entries(categories)
    .filter(([_, cat]) => cat.featured)
    .map(([slug, cat]) => {
      const inThisCat = courses.filter(
        c => Array.isArray(c.categories) && c.categories.includes(slug) && c.visible !== false
      );
      return {
        slug,
        ...cat,
        courseCount: inThisCat.length,
        sample: inThisCat.slice(0, 3),
      };
    })
    .filter(c => c.courseCount > 0)
    .slice(0, 6);

  const toggle = (slug) => {
    const next = new Set(expanded);
    next.has(slug) ? next.delete(slug) : next.add(slug);
    setExpanded(next);
  };

  const getLogo = (cat) => cat.logo_url || cat.logo || null;

  return (
    <section className="py-8 bg-gradient-to-b from-white to-orange-50/30 lg:hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <BookOpen className="h-4 w-4 mr-2" />
            Course Categories
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore by Category</h2>
          <p className="text-gray-600 text-sm">Find courses organized by your career interests</p>
        </div>

        {/* List */}
        <div className="space-y-3">
          {featured.map((cat) => {
            const isOpen = expanded.has(cat.slug);
            const logo = getLogo(cat);

            return (
              <div key={cat.slug} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => toggle(cat.slug)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center border border-orange-100">
                      {logo ? (
                        <img
                          src={logo}
                          alt={`${cat.name} logo`}
                          className="w-8 h-8 object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <BookOpen className="h-6 w-6 text-orange-600" />
                      )}
                    </div>

                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {cat.courseCount} courses
                        </span>
                        {cat.courseCount >= 3 && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-2">{isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}</div>
                </button>

                {/* Expand */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-gray-600 leading-relaxed">{cat.description}</p>

                      {/* Featured Courses */}
                      {cat.sample.length > 0 && (
                        <>
                          <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            Featured Courses:
                          </h4>

                          <div className="space-y-2">
                            {cat.sample.map((course) => (
                              <Link
                                key={course.slug}
                                to={`/courses/${course.slug}`}
                                className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-200 hover:shadow-sm transition-all group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 text-sm group-hover:text-orange-600">
                                      {course.title}
                                    </h5>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                      <span>{course.duration || '4-6 Weeks'}</span>
                                      <span>{course.level || 'Professional'}</span>
                                      {course.fees && <span className="text-orange-600 font-medium">{course.fees}</span>}
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        </>
                      )}

                      <Link
                        to={`/courses?tab=${cat.slug}`}
                        className="block w-full mt-2 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
                      >
                        View All {cat.courseCount} Courses
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View all */}
        <div className="text-center mt-8">
          <Link
            to="/courses"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-semibold hover:border-orange-300 hover:bg-orange-50 transition-all shadow-sm"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            View All Categories
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MobileCourseCategories;
