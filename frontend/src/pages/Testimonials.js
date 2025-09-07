import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote, Briefcase, GraduationCap, TrendingUp, Users } from 'lucide-react';
import SEO from '../components/SEO';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'DevOps Engineer',
      company: 'Tata Consultancy Services',
      course: 'DevOps Training',
      rating: 5,
      image: '👩‍💻',
      testimonial: "GRRAS completely transformed my career! The DevOps training was incredibly comprehensive, covering everything from AWS to Kubernetes. The hands-on approach and real-world projects gave me the confidence to crack interviews at top companies. The placement support was exceptional - they didn't just help me get a job, they helped me get my dream job!",
      duration: '6 months',
      salary: '₹8.5 LPA'
    },
    {
      id: 2,
      name: 'Rahul Agrawal',
      role: 'Data Scientist',
      company: 'Infosys Limited',
      course: 'Data Science & Machine Learning',
      rating: 5,
      image: '👨‍💼',
      testimonial: "Best decision I ever made was joining GRRAS for Data Science. The curriculum was perfectly structured, starting from Python basics to advanced ML algorithms. What impressed me most was the practical approach - working with real datasets and industry mentors. The faculty's expertise and personalized attention made all the difference.",
      duration: '8 months',
      salary: '₹12 LPA'
    },
    {
      id: 3,
      name: 'Sneha Patel',
      role: 'Software Developer',
      company: 'Wipro Technologies',
      course: 'BCA Degree Program',
      rating: 5,
      image: '👩‍🎓',
      testimonial: "The BCA program at GRRAS is unique - it's not just a degree, it's complete industry preparation. The blend of academic curriculum with practical training in cloud technologies and DevOps gave me an edge over other graduates. The placement team worked tirelessly to match me with the right opportunity.",
      duration: '3 years',
      salary: '₹6 LPA'
    },
    {
      id: 4,
      name: 'Amit Kumar',
      role: 'Cloud Infrastructure Engineer',
      company: 'IBM India',
      course: 'Red Hat Certifications',
      rating: 5,
      image: '👨‍🔧',
      testimonial: "GRRAS Red Hat training is top-notch! The authorized training center provides the best lab environment and expert instructors. I cleared RHCSA and RHCE on my first attempt. The practical approach and extensive lab sessions made complex concepts easy to understand. Got placed within 3 months of certification!",
      duration: '4 months',
      salary: '₹9 LPA'
    },
    {
      id: 5,
      name: 'Kavya Singh',
      role: 'Python Developer',
      company: 'Tech Mahindra',
      course: 'Python Programming',
      rating: 5,
      image: '👩‍💻',
      testimonial: "From zero programming knowledge to becoming a Python developer - GRRAS made it possible! The structured curriculum, patient instructors, and practical projects built my confidence step by step. The career guidance and interview preparation sessions were invaluable in landing my first tech job.",
      duration: '4 months',
      salary: '₹5.5 LPA'
    },
    {
      id: 6,
      name: 'Rohit Meena',
      role: 'Java Full Stack Developer',
      company: 'Capgemini',
      course: 'Java & Salesforce',
      rating: 5,
      image: '👨‍💻',
      testimonial: "The Java and Salesforce training at GRRAS exceeded my expectations. The dual expertise in both technologies opened multiple career paths for me. The project-based learning approach and industry-relevant curriculum made me job-ready. The faculty's real-world experience added tremendous value to the learning.",
      duration: '6 months',
      salary: '₹7.2 LPA'
    },
    {
      id: 7,
      name: 'Pooja Rajput',
      role: 'System Administrator',
      company: 'HCL Technologies',
      course: 'C/C++ & DSA',
      rating: 5,
      image: '👩‍🔧',
      testimonial: "GRRAS laid a strong foundation for my programming career. The C/C++ and DSA course improved my problem-solving skills dramatically. The focus on coding practice and algorithm implementation prepared me well for technical interviews. The supportive learning environment made complex concepts easy to grasp.",
      duration: '5 months',
      salary: '₹4.8 LPA'
    },
    {
      id: 8,
      name: 'Vishal Sharma',
      role: 'Machine Learning Engineer',
      company: 'Accenture',
      course: 'Data Science & Machine Learning',
      rating: 5,
      image: '👨‍🔬',
      testimonial: "GRRAS Data Science program is comprehensive and industry-focused. Working on real datasets and building ML models gave me practical experience that employers value. The mentorship program connected me with industry experts who guided my career path. Highly recommend for anyone serious about AI/ML career!",
      duration: '8 months',
      salary: '₹11 LPA'
    }
  ];

  const stats = [
    { number: '95%', label: 'Placement Success Rate', icon: <TrendingUp className="h-6 w-6" /> },
    { number: '₹8.2L', label: 'Average Starting Salary', icon: <Briefcase className="h-6 w-6" /> },
    { number: '100+', label: 'Hiring Partners', icon: <Users className="h-6 w-6" /> },
    { number: '5000+', label: 'Successful Alumni', icon: <GraduationCap className="h-6 w-6" /> }
  ];

  const companies = [
    'TCS', 'Infosys', 'Wipro', 'IBM', 'Capgemini', 'Tech Mahindra', 
    'HCL', 'Accenture', 'Cognizant', 'L&T Infotech', 'Mindtree', 'Hexaware'
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <>
      <SEO
        title="GRRAS Student Testimonials & Success Stories"
        description="Hear from GRRAS students who achieved career success in DevOps, Cloud, Red Hat, and BCA programs with placement support."
        keywords="GRRAS testimonials, student success stories, placement success, IT training reviews, alumni feedback, career transformation"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="py-20 gradient-bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Student Testimonials – Success Stories from GRRAS
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
                Meet our successful alumni working in top IT companies worldwide
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/admissions" className="btn-secondary">
                  Start Your Success Journey
                </Link>
                <Link to="/courses" className="btn-outline border-white text-white hover:bg-white hover:text-red-600">
                  Explore Our Courses
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stats */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Red Hat Certification Success
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real stories from students who transformed their careers with GRRAS training
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-red-500 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{testimonial.image}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                        <p className="text-sm text-red-600 font-medium">{testimonial.role}</p>
                        <p className="text-xs text-gray-500">{testimonial.company}</p>
                      </div>
                    </div>
                    <Quote className="h-6 w-6 text-gray-300 flex-shrink-0" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {renderStars(testimonial.rating)}
                    <span className="text-sm text-gray-600 ml-2">({testimonial.rating}.0)</span>
                  </div>

                  {/* Course Badge */}
                  <div className="mb-4">
                    <span className="inline-block text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {testimonial.course}
                    </span>
                  </div>

                  {/* Testimonial */}
                  <blockquote className="text-gray-700 text-sm leading-relaxed mb-4 italic">
                    "{testimonial.testimonial}"
                  </blockquote>

                  {/* Success Metrics */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Duration:</span> {testimonial.duration}
                      </div>
                      <div>
                        <span className="font-medium">Package:</span> {testimonial.salary}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hiring Partners */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Hiring Partners
              </h2>
              <p className="text-xl text-gray-600">
                Top companies that trust GRRAS trained professionals
              </p>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
              {companies.map((company, index) => (
                <div 
                  key={index}
                  className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-lg font-semibold text-gray-700">
                    {company}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Journey CTA */}
        <section className="py-16 gradient-bg-secondary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Your Success Story Starts Here
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Join thousands of successful professionals who transformed their careers with GRRAS. 
                Your dream job is just one step away!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/admissions"
                  className="btn-primary bg-white text-green-600 hover:bg-gray-100"
                >
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Start Your Journey Today
                </Link>
                
                <Link
                  to="/contact"
                  className="btn-outline border-white text-white hover:bg-white hover:text-green-600"
                >
                  Talk to Our Alumni
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 bg-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in-up">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Write Your Success Story?
              </h3>
              <p className="text-gray-600 mb-6">
                Don't just dream about your ideal career - make it happen. Join GRRAS and become our next success story.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/courses"
                  className="btn-primary"
                >
                  Explore Courses
                </Link>
                
                <a
                  href="https://wa.me/919001991227?text=Hello! I want to know about course options and placement assistance."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Testimonials;