import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Star,
  Award,
  Shield,
  Cloud,
  Settings,
  GraduationCap
} from 'lucide-react';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      title: "Master Red Hat Technologies",
      subtitle: "RHCSA, RHCE & OpenShift Certifications",
      description: "Industry-leading Linux and container technologies with hands-on labs",
      cta: "Start Your Red Hat Journey",
      ctaLink: "/courses?category=redhat",
      background: "bg-gradient-to-br from-red-600 via-red-500 to-orange-500",
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg" alt="Red Hat" className="w-16 h-16 text-white" />,
      stats: ["100% Certified Trainers", "Real Lab Environment", "Job-Ready Skills"]
    },
    {
      id: 2,
      title: "Cloud Excellence with AWS",
      subtitle: "Solutions Architect, DevOps Engineer, SysOps",
      description: "Master cloud computing with Amazon Web Services and boost your career",
      cta: "Launch Your Cloud Career",
      ctaLink: "/courses?category=aws",
      background: "bg-gradient-to-br from-orange-600 via-yellow-500 to-orange-400",
      icon: <Cloud className="w-16 h-16 text-white" />,
      stats: ["AWS Certified Instructors", "Real Projects", "Industry Placement"]
    },
    {
      id: 3,
      title: "DevOps Mastery Program",
      subtitle: "Docker, Kubernetes, CI/CD Pipeline",
      description: "Transform your career with modern DevOps practices and automation tools",
      cta: "Transform Your Career",
      ctaLink: "/courses?category=devops",
      background: "bg-gradient-to-br from-blue-600 via-cyan-500 to-green-500",
      icon: <Settings className="w-16 h-16 text-white" />,
      stats: ["Industry Tools", "Real Pipelines", "Expert Mentorship"]
    },
    {
      id: 4,
      title: "Cybersecurity & Ethical Hacking",
      subtitle: "Protect Digital Assets, Secure the Future",
      description: "Learn cutting-edge security techniques and ethical hacking methodologies",
      cta: "Become Security Expert",
      ctaLink: "/courses?category=cybersecurity",
      background: "bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600",
      icon: <Shield className="w-16 h-16 text-white" />,
      stats: ["Certified Trainers", "Real Attack Scenarios", "Hands-on Labs"]
    },
    {
      id: 5,
      title: "Industry-Ready Degree Programs",
      subtitle: "BCA, MCA with 100% Placement Support",
      description: "Get your degree with modern tech skills and guaranteed placement assistance",
      cta: "Secure Your Future",
      ctaLink: "/courses?category=degree",
      background: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600",
      icon: <GraduationCap className="w-16 h-16 text-white" />,
      stats: ["Industry Curriculum", "100% Placement", "Modern Skills"]
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative min-h-[350px] md:min-h-[400px] lg:min-h-[380px] overflow-hidden">
      {/* Background Slide */}
      <div className={`absolute inset-0 transition-all duration-1000 ${currentSlideData.background}`}>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-40 w-16 h-16 border-2 border-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            {/* Icon */}
            <div className="flex justify-center lg:justify-start mb-4 lg:mb-6">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                {currentSlideData.icon}
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3 lg:mb-4 text-white">
              {currentSlideData.title}
            </h1>
            
            <h2 className="text-base md:text-lg lg:text-xl text-gray-100 mb-3 lg:mb-4 leading-relaxed font-medium">
              {currentSlideData.subtitle}
            </h2>
            
            <p className="text-sm lg:text-base text-gray-200 mb-4 lg:mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {currentSlideData.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 lg:gap-3 mb-4 lg:mb-6">
              {currentSlideData.stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-1 lg:gap-2 bg-white bg-opacity-20 rounded-full px-2 lg:px-3 py-1 lg:py-2 backdrop-blur-sm">
                  <Star className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400 fill-current" />
                  <span className="text-white text-xs lg:text-sm font-medium">{stat}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 justify-center lg:justify-start">
              <Link
                to={currentSlideData.ctaLink}
                className="inline-flex items-center justify-center gap-2 lg:gap-3 bg-white text-gray-900 px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-bold text-sm lg:text-base hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                {currentSlideData.cta}
                <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
              </Link>
              
              <Link
                to="/admissions"
                className="inline-flex items-center justify-center gap-2 lg:gap-3 border-2 border-white text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-bold text-sm lg:text-base hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
              >
                Apply Now
                <Award className="h-4 w-4 lg:h-5 lg:w-5" />
              </Link>
            </div>
          </div>

          {/* Right Content Card */}
          <div className="hidden xl:block animate-fade-in-right">
            <div className="bg-white bg-opacity-15 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 shadow-2xl">
              {/* Dynamic Content Based on Slide */}
              {currentSlide === 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Red Hat Excellence</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">95%</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Success Rate</div>
                        <div className="text-gray-200 text-sm">Red Hat Certified</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">500+</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Students Certified</div>
                        <div className="text-gray-200 text-sm">RHCSA & RHCE</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">18+</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Years Experience</div>
                        <div className="text-gray-200 text-sm">Linux Training</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-black bg-opacity-30 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">₹8-15 LPA</div>
                      <div className="text-gray-200 text-sm">Average Package</div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentSlide === 1 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">AWS Cloud Journey</h3>
                  <div className="space-y-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Award className="h-6 w-6 text-yellow-400" />
                        <span className="text-white font-semibold">Solutions Architect</span>
                      </div>
                      <div className="text-gray-200 text-sm">Design scalable cloud solutions</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Settings className="h-6 w-6 text-blue-400" />
                        <span className="text-white font-semibold">DevOps Engineer</span>
                      </div>
                      <div className="text-gray-200 text-sm">Automate cloud infrastructure</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="h-6 w-6 text-green-400" />
                        <span className="text-white font-semibold">SysOps Admin</span>
                      </div>
                      <div className="text-gray-200 text-sm">Manage cloud operations</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-black bg-opacity-30 rounded-xl text-center">
                    <div className="text-xl font-bold text-white mb-1">₹12-25 LPA</div>
                    <div className="text-gray-200 text-sm">Cloud Engineer Salary</div>
                  </div>
                </div>
              )}
              
              {currentSlide === 2 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">DevOps Tools Mastery</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                      <div className="text-white font-semibold text-sm mb-1">Docker</div>
                      <div className="text-gray-200 text-xs">Containerization</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                      <div className="text-white font-semibold text-sm mb-1">Kubernetes</div>
                      <div className="text-gray-200 text-xs">Orchestration</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                      <div className="text-white font-semibold text-sm mb-1">Jenkins</div>
                      <div className="text-gray-200 text-xs">CI/CD</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                      <div className="text-white font-semibold text-sm mb-1">Ansible</div>
                      <div className="text-gray-200 text-xs">Automation</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Course Completion</span>
                      <span className="text-green-400 font-semibold">92%</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-black bg-opacity-30 rounded-xl text-center">
                    <div className="text-xl font-bold text-white mb-1">₹10-20 LPA</div>
                    <div className="text-gray-200 text-sm">DevOps Engineer Salary</div>
                  </div>
                </div>
              )}
              
              {currentSlide === 3 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Security Skills</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Penetration Testing</div>
                        <div className="text-gray-200 text-sm">Find vulnerabilities</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Settings className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Network Security</div>
                        <div className="text-gray-200 text-sm">Secure infrastructure</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Ethical Hacking</div>
                        <div className="text-gray-200 text-sm">Legal security testing</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-white bg-opacity-20 rounded-xl p-4">
                    <div className="text-center mb-3">
                      <div className="text-white font-semibold">High Demand Field</div>
                    </div>
                    <div className="text-2xl font-bold text-center text-white mb-1">₹15-30 LPA</div>
                    <div className="text-gray-200 text-sm text-center">Security Expert Salary</div>
                  </div>
                </div>
              )}
              
              {currentSlide === 4 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Degree Benefits</h3>
                  <div className="space-y-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <GraduationCap className="h-5 w-5 text-yellow-400" />
                        <span className="text-white font-semibold">BCA Program</span>
                      </div>
                      <div className="text-gray-200 text-sm">3-year industry-ready degree</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="h-5 w-5 text-green-400" />
                        <span className="text-white font-semibold">100% Placement</span>
                      </div>
                      <div className="text-gray-200 text-sm">Guaranteed job assistance</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="h-5 w-5 text-blue-400 fill-current" />
                        <span className="text-white font-semibold">Industry Skills</span>
                      </div>
                      <div className="text-gray-200 text-sm">Modern tech curriculum</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-black bg-opacity-30 rounded-xl">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white mb-1">₹6-12 LPA</div>
                      <div className="text-gray-200 text-sm">Fresher Package</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 lg:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all backdrop-blur-sm"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={toggleAutoPlay}
          className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all backdrop-blur-sm ml-4"
        >
          <Play className={`h-5 w-5 text-white ${isPlaying ? 'hidden' : 'block'}`} />
          <div className={`w-2 h-2 bg-white ${isPlaying ? 'block' : 'hidden'}`}></div>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black bg-opacity-20">
        <div 
          className="h-full bg-white transition-all duration-5000 ease-linear"
          style={{ 
            width: isPlaying ? '100%' : '0%',
            animation: isPlaying ? 'progress 5s linear infinite' : 'none'
          }}
        />
      </div>
    </section>
  );
};

export default HeroSlider;