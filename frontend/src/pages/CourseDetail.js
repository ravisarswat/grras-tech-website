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
  Briefcase
} from 'lucide-react';
import SEO, { CoursePageSEO } from '../components/SEO';
import SyllabusModal from '../components/SyllabusModal';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CourseDetail = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [slug]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`${API}/courses/${slug}`);
      const courseData = response.data;
      
      // Use ONLY CMS data - no static fallbacks
      const courseWithDefaults = {
        ...courseData,
        // Ensure arrays exist but don't override with static data
        highlights: courseData.highlights || [],
        learningOutcomes: courseData.learningOutcomes || courseData.outcomes || [],
        careerRoles: courseData.careerRoles || [],
        tools: courseData.tools || [],
        mode: courseData.mode || [],
        // Ensure seo object exists
        seo: courseData.seo || {},
        // Set defaults for missing optional fields
        overview: courseData.overview || courseData.description || '',
        certificateInfo: courseData.certificateInfo || '',
        batchesInfo: courseData.batchesInfo || '',
        eligibility: courseData.eligibility || 'Contact for details',
        level: courseData.level || 'All Levels',
        category: courseData.category || 'Training'
      };
      
      setCourse(courseWithDefaults);
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Course not found');
    } finally {
      setLoading(false);
    }
  };

  const getCourseExtendedDetails = (slug) => {
    const details = {
      'bca-degree': {
        tagline: 'Industry-Integrated Bachelor Degree Program',
        description: 'A comprehensive 3-year BCA degree program designed with industry integration, covering modern technologies like cloud computing, DevOps, and AI/ML along with traditional computer science fundamentals.',
        duration: '3 Years (6 Semesters)',
        level: 'Beginner to Advanced',
        category: 'Degree Program',
        icon: '🎓',
        color: 'from-blue-500 to-indigo-600',
        highlights: [
          'UGC Recognized Degree',
          'Industry-Integrated Curriculum',
          'Cloud & DevOps Specialization',
          'AI/ML Foundation',
          'Placement Assistance',
          '100+ Hiring Partners'
        ],
        outcomes: [
          'Strong foundation in computer science and programming',
          'Expertise in modern technologies and cloud platforms',
          'Industry-ready skills for software development roles',
          'Problem-solving and analytical thinking abilities',
          'Professional communication and teamwork skills'
        ],
        careerPaths: [
          'Software Developer',
          'Cloud Engineer',
          'DevOps Engineer',
          'Data Analyst',
          'System Administrator',
          'Technical Support Engineer'
        ],
        fees: 'Contact for Details',
        batch: 'New batches every semester'
      },
      'devops-training': {
        tagline: 'Master Modern DevOps Practices & Cloud Technologies',
        description: 'Comprehensive DevOps training covering the complete DevOps lifecycle, cloud platforms, containerization, orchestration, and automation tools used in modern software development.',
        duration: '6 Months (Intensive)',
        level: 'Intermediate to Advanced',
        category: 'Professional Training',
        icon: '⚙️',
        color: 'from-green-500 to-teal-600',
        highlights: [
          'Hands-on AWS Labs',
          'Real-time Projects',
          'Industry Mentorship',
          'DevOps Certification Prep',
          '24/7 Lab Access',
          'Job Placement Support'
        ],
        outcomes: [
          'Master AWS cloud services and deployment strategies',
          'Implement CI/CD pipelines using Jenkins and GitLab',
          'Container orchestration with Docker and Kubernetes',
          'Infrastructure as Code with Terraform and Ansible',
          'Monitoring and logging with modern DevOps tools'
        ],
        careerPaths: [
          'DevOps Engineer',
          'Cloud Engineer',
          'Site Reliability Engineer',
          'Infrastructure Engineer',
          'Build & Release Engineer',
          'Platform Engineer'
        ],
        batch: 'Monthly Batches'
      },
      'redhat-certifications': {
        tagline: 'Official Red Hat Training & Certification Programs',
        description: 'Official Red Hat authorized training covering RHCSA, RHCE, and OpenShift certifications with hands-on lab experience and expert instruction from certified trainers.',
        duration: '4-6 Months (Per Certification)',
        level: 'Intermediate to Expert',
        category: 'Certification Training',
        icon: '🐧',
        color: 'from-red-500 to-pink-600',
        highlights: [
          'Official Red Hat Training',
          'Certified Instructors',
          'Hands-on Lab Environment',
          'Exam Vouchers Included',
          'Multiple Certification Paths',
          '100% Exam Pass Guarantee'
        ],
        outcomes: [
          'Master Red Hat Enterprise Linux administration',
          'Advanced system administration and automation',
          'OpenShift container platform expertise',
          'Enterprise-level Linux security implementation',
          'Multi-user environment management'
        ],
        careerPaths: [
          'Linux System Administrator',
          'Red Hat Certified Engineer',
          'OpenShift Administrator',
          'Cloud Platform Engineer',
          'Enterprise Infrastructure Specialist',
          'DevOps Platform Engineer'
        ],
        batch: 'Monthly Batches'
      },
      'data-science-machine-learning': {
        tagline: 'Complete Data Science & Machine Learning Program',
        description: 'Comprehensive data science program covering statistics, Python programming, machine learning algorithms, deep learning, and real-world project implementation.',
        duration: '8 Months (Comprehensive)',
        level: 'Beginner to Advanced',
        category: 'Professional Training',
        icon: '📊',
        color: 'from-purple-500 to-violet-600',
        highlights: [
          'Python & R Programming',
          'Real Dataset Projects',
          'Industry Mentorship',
          'Portfolio Development',
          'Jupyter Notebook Access',
          'Career Transition Support'
        ],
        outcomes: [
          'Master Python for data science and analytics',
          'Implement machine learning algorithms from scratch',
          'Work with real datasets and business problems',
          'Build predictive models and data visualizations',
          'Deploy ML models in production environments'
        ],
        careerPaths: [
          'Data Scientist',
          'Machine Learning Engineer',
          'Data Analyst',
          'Business Intelligence Analyst',
          'Research Scientist',
          'AI/ML Consultant'
        ],
        batch: 'Weekend & Evening Batches'
      },
      'java-salesforce': {
        tagline: 'Enterprise Java & Salesforce Development',
        description: 'Comprehensive program covering Core Java, Advanced Java frameworks, and Salesforce platform development for enterprise-level applications.',
        duration: '6 Months (Intensive)',
        level: 'Intermediate to Advanced',
        category: 'Professional Training',
        icon: '☕',
        color: 'from-orange-500 to-red-600',
        highlights: [
          'Core & Advanced Java',
          'Salesforce Admin & Development',
          'Enterprise Project Work',
          'Industry Best Practices',
          'Certification Preparation',
          'Placement Support'
        ],
        outcomes: [
          'Master Java programming and enterprise frameworks',
          'Develop custom applications on Salesforce platform',
          'Implement business logic and integrations',
          'Work with databases and web services',
          'Build scalable enterprise applications'
        ],
        careerPaths: [
          'Java Developer',
          'Salesforce Developer',
          'Enterprise Application Developer',
          'Backend Developer',
          'Technical Consultant',
          'Full Stack Developer'
        ],
        batch: 'Weekday & Weekend Options'
      },
      'python': {
        tagline: 'Complete Python Programming & Web Development',
        description: 'Comprehensive Python programming course covering fundamentals, web development, automation, and career guidance for various Python career paths.',
        duration: '4 Months (Flexible)',
        level: 'Beginner to Intermediate',
        category: 'Programming Training',
        icon: '🐍',
        color: 'from-yellow-500 to-orange-600',
        highlights: [
          'Python Fundamentals',
          'Web Development (Django/Flask)',
          'Automation & Scripting',
          'Database Integration',
          'Project Portfolio',
          'Career Guidance'
        ],
        outcomes: [
          'Master Python programming fundamentals',
          'Build web applications using Django/Flask',
          'Create automation scripts and tools',
          'Work with databases and APIs',
          'Develop a strong programming portfolio'
        ],
        careerPaths: [
          'Python Developer',
          'Web Developer',
          'Automation Engineer',
          'Backend Developer',
          'Data Analyst',
          'DevOps Engineer'
        ],
        batch: 'Flexible Timings'
      },
      'c-cpp-dsa': {
        tagline: 'Foundation Programming with C/C++ & Data Structures',
        description: 'Complete foundation course covering C and C++ programming languages along with comprehensive data structures and algorithms training.',
        duration: '5 Months (Foundation)',
        level: 'Beginner to Intermediate',
        category: 'Foundation Programming',
        icon: '💻',
        color: 'from-gray-500 to-gray-700',
        highlights: [
          'C Programming Fundamentals',
          'Object-Oriented Programming (C++)',
          'Data Structures Implementation',
          'Algorithm Design & Analysis',
          'Problem Solving Techniques',
          'Coding Practice Sessions'
        ],
        outcomes: [
          'Strong foundation in C and C++ programming',
          'Implement various data structures efficiently',
          'Design and analyze algorithms',
          'Solve complex programming problems',
          'Prepare for technical interviews'
        ],
        careerPaths: [
          'Software Developer',
          'System Programmer',
          'Embedded Systems Engineer',
          'Game Developer',
          'Competitive Programmer',
          'Technical Trainer'
        ],
        batch: 'Regular Batches'
      },
      'cyber-security': {
        tagline: 'Master Cyber Security & Ethical Hacking',
        description: 'Comprehensive cyber security training covering ethical hacking, penetration testing, network security, and digital forensics with hands-on lab experience.',
        duration: '6 Months (Advanced)',
        level: 'Intermediate to Advanced',
        category: 'Security Training',
        icon: '🔒',
        color: 'from-red-600 to-red-800',
        highlights: [
          'Ethical Hacking Techniques',
          'Penetration Testing Tools',
          'Network Security Assessment',
          'Digital Forensics Basics',
          'Security Incident Response',
          'Certification Preparation'
        ],
        outcomes: [
          'Master cyber security fundamentals and best practices',
          'Perform comprehensive security assessments',
          'Use industry-standard penetration testing tools',
          'Implement security measures and incident response',
          'Understand legal and ethical aspects of security testing'
        ],
        careerPaths: [
          'Cyber Security Analyst',
          'Ethical Hacker',
          'Penetration Tester',
          'Security Consultant',
          'Information Security Officer',
          'Incident Response Specialist'
        ],
        batch: 'Monthly Batches'
      }
    };

    return details[slug] || null;
  };

  const getStaticCourseData = (slug) => {
    const courseNames = {
      'bca-degree': 'BCA Degree Program',
      'devops-training': 'DevOps Training',
      'redhat-certifications': 'Red Hat Certifications',
      'data-science-machine-learning': 'Data Science & Machine Learning',
      'java-salesforce': 'Java & Salesforce',
      'python': 'Python',
      'c-cpp-dsa': 'C/C++ & DSA',
      'cyber-security': 'Cyber Security'
    };

    if (!courseNames[slug]) return null;

    return {
      slug,
      name: courseNames[slug],
      tools: [],
      ...getCourseExtendedDetails(slug)
    };
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
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
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
        <section className={`py-20 bg-gradient-to-br ${course.color} text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Course Info */}
              <div className="animate-fade-in-up">
                <Link 
                  to="/courses"
                  className="inline-flex items-center text-white hover:text-gray-200 mb-6 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Courses
                </Link>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-6xl">{course.icon}</div>
                  <div>
                    <span className="text-lg font-medium opacity-90">{course.category}</span>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {course.name}
                </h1>
                
                <p className="text-xl text-gray-100 mb-6">
                  {course.tagline}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm mb-8">
                  <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                    <Users className="h-4 w-4" />
                    <span>{course.level}</span>
                  </div>
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
                    onClick={() => setShowSyllabusModal(true)}
                    className="btn-primary w-full text-center mb-4"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Syllabus (PDF)
                  </button>
                  
                  <div className="text-center text-sm text-gray-500 mb-4">
                    Free download • No spam • Instant access
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Course Fee:</span>
                      <span className="font-semibold text-gray-900">{course.fees}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-600">Batches:</span>
                      <span className="font-semibold text-gray-900">{course.batch}</span>
                    </div>
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Certificate Information
                    </h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {course.certificateInfo}
                    </div>
                  </div>
                )}

                {/* Batch Information */}
                {course.batchesInfo && (
                  <div className="bg-white rounded-xl p-8 shadow-lg animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Batch Information
                    </h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {course.batchesInfo}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Course Highlights */}
                <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Course Highlights
                  </h3>
                  <div className="space-y-3">
                    {course.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-700 text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Get Started Today
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowSyllabusModal(true)}
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
        isOpen={showSyllabusModal}
        onClose={() => setShowSyllabusModal(false)}
        courseSlug={course.slug}
        courseName={course.name}
      />
    </>
  );
};

export default CourseDetail;