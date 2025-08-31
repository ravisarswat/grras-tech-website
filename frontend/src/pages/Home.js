import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Users, 
  BookOpen, 
  TrendingUp, 
  CheckCircle, 
  Star,
  ArrowRight,
  Target,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import SEO from '../components/SEO';
import CourseSearchBar from '../components/CourseSearchBar';
import CourseCategoriesGrid from '../components/CourseCategoriesGrid';
import LearningPathsPreview from '../components/LearningPathsPreview';
import { useContent } from '../contexts/ContentContext';


const Home = () => {
  const { content } = useContent();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState({
    years: 0,
    students: 0,
    certifications: 0,
    placement: 0
  });

  // Animate stats on load
  useEffect(() => {
    const targetStats = { years: 10, students: 5000, certifications: 1500, placement: 95 };
    
    const animateStats = () => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setStats({
          years: Math.floor(targetStats.years * progress),
          students: Math.floor(targetStats.students * progress),
          certifications: Math.floor(targetStats.certifications * progress),
          placement: Math.floor(targetStats.placement * progress)
        });
        
        if (step >= steps) {
          clearInterval(timer);
          setStats(targetStats);
        }
      }, increment);
    };
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateStats();
        observer.disconnect();
      }
    });
    
    const statsElement = document.getElementById('stats-section');
    if (statsElement) {
      observer.observe(statsElement);
    }
    
    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  // Get popular courses configuration from CMS
  const popularCoursesConfig = content?.pages?.home?.popularCourses || {};
  const allCourses = content?.courses || [];
  
  // Generate popular courses based on CMS configuration
  const getPopularCourses = () => {
    const { selectionMode = 'auto', maxItems = 4, manualSelection = [] } = popularCoursesConfig;
    
    // Filter visible courses
    const visibleCourses = allCourses.filter(course => course.visible !== false);
    
    let selectedCourses;
    if (selectionMode === 'manual' && manualSelection.length > 0) {
      // Manual selection: use admin-selected courses
      selectedCourses = manualSelection
        .map(slug => visibleCourses.find(course => course.slug === slug))
        .filter(Boolean); // Remove any null/undefined results
    } else {
      // Auto selection: use featured courses or first N courses
      selectedCourses = visibleCourses
        .filter(course => course.featured || course.popular)
        .sort((a, b) => (a.order || 999) - (b.order || 999));
      
      // If not enough featured courses, add more from visible courses
      if (selectedCourses.length < maxItems) {
        const remainingCourses = visibleCourses
          .filter(course => !selectedCourses.find(sc => sc.slug === course.slug))
          .sort((a, b) => (a.order || 999) - (b.order || 999));
        selectedCourses = [...selectedCourses, ...remainingCourses];
      }
    }
    
    return selectedCourses.slice(0, maxItems);
  };

  const featuredCourses = getPopularCourses();
  
  // Fallback courses if no CMS courses available
  const fallbackCourses = [
    {
      slug: 'bca-degree',
      title: 'BCA Degree Program',
      oneLiner: 'Industry-Integrated Bachelor Degree',
      overview: 'Complete BCA program with cloud computing, DevOps, and AI/ML specializations.',
      duration: '3 Years',
      level: 'Beginner to Advanced',
      highlights: ['Recognized Degree', 'Industry Projects', 'Placement Assistance'],
      icon: '🎓'
    },
    {
      slug: 'devops-training',
      title: 'DevOps Training',
      oneLiner: 'Master Modern DevOps Practices',
      overview: 'Comprehensive DevOps training covering AWS, Docker, Kubernetes, Jenkins, and more.',
      duration: '6 Months',
      level: 'Intermediate',
      highlights: ['Hands-on Labs', 'AWS Certification', 'Live Projects'],
      icon: '⚙️'
    },
    {
      slug: 'data-science-machine-learning',
      title: 'Data Science & ML',
      oneLiner: 'Future of Technology',
      overview: 'Complete data science program with Python, statistics, and machine learning.',
      duration: '8 Months',
      level: 'Beginner to Advanced',
      highlights: ['Python Mastery', 'Real Datasets', 'Industry Mentors'],
      icon: '📊'
    },
    {
      slug: 'redhat-certifications',
      title: 'Red Hat Certifications',
      oneLiner: 'Linux & OpenShift Excellence',
      overview: 'RHCSA, RHCE, and OpenShift certifications with hands-on experience.',
      duration: '4 Months',
      level: 'Intermediate',
      highlights: ['Official Certification', 'Lab Access', 'Expert Trainers'],
      icon: '🐧'
    }
  ];

  // Use CMS courses or fallback
  const displayCourses = featuredCourses.length > 0 ? featuredCourses : fallbackCourses.slice(0, popularCoursesConfig.maxItems || 4);

  const highlights = [
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: 'Recognized Degree Programs',
      description: 'Industry-integrated BCA degree with modern tech specializations'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Industry-Oriented Training',
      description: 'Practical, hands-on training aligned with current market demands'
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: 'Placement Assistance',
      description: '95% placement success rate with top IT companies'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'DevOps Engineer at TCS',
      content: 'GRRAS transformed my career! The DevOps training was comprehensive and the placement support was excellent.',
      rating: 5,
      course: 'DevOps Training'
    },
    {
      name: 'Rahul Agrawal',
      role: 'Data Scientist at Infosys',
      content: 'Best decision I made was joining GRRAS for Data Science. The practical approach and mentorship were outstanding.',
      rating: 5,
      course: 'Data Science & ML'
    },
    {
      name: 'Sneha Patel',
      role: 'Software Developer at Wipro',
      content: 'The BCA program at GRRAS gave me both degree and industry skills. Highly recommend!',
      rating: 5,
      course: 'BCA Degree Program'
    },
    {
      name: 'Amit Kumar',
      role: 'Cloud Engineer at IBM',
      content: 'Red Hat certification training was top-notch. Got certified and placed within 3 months!',
      rating: 5,
      course: 'Red Hat Certifications'
    }
  ];

  return (
    <>
      <SEO />
      
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center hero-bg">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white max-w-5xl mx-auto">
              Empowering Students with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                World-Class
              </span>{' '}
              IT & Cloud Education
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed max-w-4xl mx-auto">
              From Degree Programs to Cutting-Edge Certifications
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/courses"
                className="btn-primary text-center animate-pulse-hover"
              >
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <Link
                to="/admissions"
                className="btn-outline bg-white bg-opacity-10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-gray-900 text-center"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose GRRAS Solutions?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing world-class IT education with industry relevance
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <div 
                key={index}
                className="text-center p-8 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-lg transition-all duration-300 animate-fade-in-up card-hover"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
                  {highlight.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {highlight.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Discovery Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect Course
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover courses that match your career goals with our smart search and category-based navigation
            </p>
            
            {/* Course Search Bar */}
            <CourseSearchBar />
          </div>
        </div>
      </section>

      {/* Course Categories Grid */}
      <CourseCategoriesGrid />

      {/* Featured Courses Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {popularCoursesConfig.title || 'Our Popular Courses'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {popularCoursesConfig.subtitle || 'Industry-relevant courses designed to make you job-ready'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {displayCourses.map((course, index) => (
              <div 
                key={course.slug}
                className="course-card relative p-8 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{course.icon || '📚'}</div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    {course.level || 'All Levels'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.title || course.name}
                </h3>
                
                <p className="text-red-600 font-medium mb-3">
                  {course.oneLiner || course.tagline || 'Professional Training Course'}
                </p>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {course.overview || course.description || ''}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>📅 {course.duration}</span>
                </div>
                
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {course.highlights.map((highlight, i) => (
                      <span 
                        key={i}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full"
                      >
                        ✓ {highlight}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Link
                  to={`/courses/${course.slug}`}
                  className="btn-primary w-full text-center"
                >
                  View Details & Download Syllabus
                </Link>
              </div>
            ))}
          </div>
          
          {(popularCoursesConfig.showViewAll !== false) && (
            <div className="text-center mt-12">
              <Link
                to="/courses"
                className="btn-outline inline-flex items-center"
              >
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-20 gradient-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in-up">
              <div className="stats-number">{stats.years}+</div>
              <p className="text-white text-lg">Years of Excellence</p>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="stats-number">{stats.students.toLocaleString()}+</div>
              <p className="text-white text-lg">Students Trained</p>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="stats-number">{stats.certifications.toLocaleString()}+</div>
              <p className="text-white text-lg">Certifications</p>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="stats-number">{stats.placement}%</div>
              <p className="text-white text-lg">Placement Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our successful alumni working in top companies
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="testimonial-card animate-fade-in-up">
              <div className="flex items-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed italic">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </p>
                  <p className="text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600 font-medium">
                    {testimonials[currentTestimonial].course}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/testimonials"
              className="btn-outline inline-flex items-center"
            >
              Read More Success Stories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Admissions CTA */}
      <section className="py-20 gradient-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your IT Career?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of successful students. Get industry-relevant training, 
              recognized certifications, and guaranteed placement assistance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/admissions"
                className="btn-primary bg-white text-green-600 hover:bg-gray-100"
              >
                Start Admission Process
              </Link>
              
              <Link
                to="/contact"
                className="btn-outline border-white text-white hover:bg-white hover:text-green-600"
              >
                Talk to Counselor
              </Link>
            </div>
          </div>
        </div>
      </section>


    </>
  );
};

export default Home;