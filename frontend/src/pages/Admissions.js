import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  Users, 
  GraduationCap, 
  Briefcase,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  FileText,
  Award
} from 'lucide-react';
import SEO from '../components/SEO';
import { useContent } from '../contexts/ContentContext';
import EligibilityWidget from '../components/EligibilityWidget';

const Admissions = () => {
  const { content } = useContent();

  // Get courses from CMS instead of hardcoded data
  const cmsCoursesData = content?.courses || [];
  const featuredCourses = cmsCoursesData
    .filter(course => course.visible !== false && course.featured)
    .slice(0, 4)
    .map(course => ({
      name: course.title,
      slug: course.slug,
      eligibility: course.eligibility || 'Contact for details',
      duration: course.duration,
      fees: course.fees, // Dynamic from CMS
      intake: course.intake || 'Monthly Batches',
      highlights: course.highlights ? course.highlights.slice(0, 3) : ['Quality Training', 'Expert Faculty', 'Placement Support']
    }));

  const admissionProcess = [
    {
      step: 1,
      title: 'Inquiry',
      description: 'Submit your inquiry through our website, phone, or visit our campus',
      icon: <Mail className="h-6 w-6" />,
      actions: ['Online form', 'Phone call', 'Campus visit']
    },
    {
      step: 2,
      title: 'Counseling',
      description: 'Meet with our expert counselors to discuss your career goals and course options',
      icon: <Users className="h-6 w-6" />,
      actions: ['Career assessment', 'Course selection', 'Fee discussion']
    },
    {
      step: 3,
      title: 'Enrollment',
      description: 'Complete the enrollment process with required documents and fee payment',
      icon: <FileText className="h-6 w-6" />,
      actions: ['Document submission', 'Fee payment', 'Seat confirmation']
    },
    {
      step: 4,
      title: 'Onboarding',
      description: 'Join orientation session and start your learning journey',
      icon: <GraduationCap className="h-6 w-6" />,
      actions: ['Orientation program', 'Lab access', 'Learning resources']
    }
  ];

  // Use CMS courses if available, otherwise fallback to hardcoded data
  const fallbackCourses = [
    {
      name: 'BCA Degree Program',
      slug: 'bca-degree',
      eligibility: '12th Pass (Any Stream)',
      duration: '3 Years',
      fees: 'Contact for Details',
      intake: 'July & January',
      highlights: ['UGC Recognized', 'Industry Integration', 'Placement Assistance']
    },
    {
      name: 'DevOps Training',
      slug: 'devops-training',
      eligibility: 'Graduate + Basic IT Knowledge',
      duration: '6 Months',
      fees: '₹45,000',
      intake: 'Monthly Batches',
      highlights: ['AWS Certification', 'Hands-on Labs', 'Job Guarantee']
    },
    {
      name: 'Data Science & ML',
      slug: 'data-science-machine-learning',
      eligibility: 'Graduate (Any Stream)',
      duration: '8 Months',
      fees: '₹55,000',
      intake: 'Bi-monthly',
      highlights: ['Python Mastery', 'Real Projects', 'Portfolio Building']
    },
    {
      name: 'Red Hat Certifications',
      slug: 'redhat-certifications',
      eligibility: 'Basic Linux Knowledge',
      duration: '4-6 Months',
      fees: '₹35,000-₹65,000',
      intake: 'Monthly',
      highlights: ['Official Training', 'Exam Voucher', 'Lab Access']
    }
  ];

  // Use CMS courses if available, otherwise use fallback
  const courses = featuredCourses.length > 0 ? featuredCourses : fallbackCourses;

  const faqs = [
    {
      category: 'Eligibility',
      questions: [
        {
          q: 'What is the minimum eligibility for BCA program?',
          a: '12th pass from any recognized board. No specific stream requirement.'
        },
        {
          q: 'Can I join professional courses without a tech background?',
          a: 'Yes, our courses are designed for beginners. We provide foundation modules for non-tech backgrounds.'
        }
      ]
    },
    {
      category: 'Fees & Payment',
      questions: [
        {
          q: 'Do you offer EMI options?',
          a: 'Yes, we provide flexible EMI options for all courses. Contact our admission team for details.'
        },
        {
          q: 'Are there any scholarships available?',
          a: 'We offer merit-based scholarships and special discounts for early registrations.'
        }
      ]
    },
    {
      category: 'Placement',
      questions: [
        {
          q: 'What is your placement success rate?',
          a: 'We have a 95% placement success rate with our network of 100+ hiring partners.'
        },
        {
          q: 'Do you provide placement assistance for all courses?',
          a: 'Yes, all students receive comprehensive placement assistance including resume building, interview preparation, and job referrals.'
        }
      ]
    },
    {
      category: 'Course Structure',
      questions: [
        {
          q: 'What is the batch size?',
          a: 'We maintain small batch sizes of 20-25 students to ensure personalized attention.'
        },
        {
          q: 'Are there flexible timings available?',
          a: 'Yes, we offer morning, evening, and weekend batches to accommodate working professionals.'
        }
      ]
    }
  ];



  return (
    <>
      <SEO
        title="Admissions at GRRAS Solutions | Apply for IT Training & BCA"
        description="Start your IT journey with GRRAS Solutions. Apply for DevOps, Red Hat, BCA, Data Science & Cloud courses with placement & internship opportunities."
        keywords="GRRAS admissions, IT course admission, BCA admission Jaipur, DevOps training admission, admission process"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="py-20 gradient-bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Admissions – Start Your IT Career at GRRAS
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
                Simple admission process, flexible payment options, and guaranteed placement assistance
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="btn-secondary">
                  Talk to Counselor
                </Link>
                <a 
                  href="tel:+919001991227"
                  className="btn-outline border-white text-white hover:bg-white hover:text-red-600"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now: 090019 91227
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Admission Process */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Admission Process
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started with your IT education journey in just a few simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {admissionProcess.map((process, index) => (
                <div 
                  key={index}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white mb-4">
                      {process.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {process.step}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {process.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {process.description}
                  </p>
                  
                  <div className="space-y-2">
                    {process.actions.map((action, i) => (
                      <div key={i} className="flex items-center justify-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Eligibility Checker */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Documents Required
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Find out if you meet the requirements for your chosen course and get personalized guidance
              </p>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <EligibilityWidget />
            </div>
          </div>
        </section>

        {/* Course Options */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Scholarships & Stipends
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our comprehensive range of IT courses and degree programs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {courses.map((course, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {course.name}
                    </h3>
                    <Award className="h-6 w-6 text-red-500" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{course.eligibility}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{course.fees}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{course.intake}</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {course.highlights.map((highlight, i) => (
                        <span 
                          key={i}
                          className="text-xs bg-white text-red-700 px-2 py-1 rounded-full border border-red-200"
                        >
                          ✓ {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link
                      to={`/courses/${course.slug}`}
                      className="btn-outline flex-1 text-center text-sm"
                    >
                      View Details
                    </Link>
                    <Link
                      to="/contact"
                      className="btn-primary flex-1 text-center text-sm"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Get answers to common questions about admissions and courses
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  How do I apply for a course at GRRAS?
                </h3>
                <p className="text-gray-600">
                  You can apply online through our website, call us directly, or visit our campus. Our admission counselors will guide you through the entire process.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Are there scholarships available?
                </h3>
                <p className="text-gray-600">
                  Yes, we offer merit-based scholarships, early bird discounts, and special scholarships for students from economically weaker sections.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I apply online?
                </h3>
                <p className="text-gray-600">
                  Yes, you can apply online through our website. Fill out the inquiry form, and our admission team will contact you for further assistance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 gradient-bg-secondary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Begin Your IT Career?
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Don't wait! Limited seats available. Start your admission process today 
                and join thousands of successful GRRAS alumni.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="btn-primary bg-white text-green-600 hover:bg-gray-100"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Talk to Admission Counselor
                </Link>
                
                <a
                  href="https://wa.me/919001991227?text=Hello! I want to know about the admission process."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline border-white text-white hover:bg-white hover:text-green-600"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  WhatsApp: 090019 91227
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Admissions;