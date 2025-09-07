import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Star,
  Award,
  Shield
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
      icon: <img src="https://cdn.worldvectorlogo.com/logos/red-hat-1.svg" alt="Red Hat" className="w-full h-full object-contain" />,
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
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="AWS" className="w-full h-full object-contain filter brightness-0 invert" />,
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
      icon: <img src="https://cdn.worldvectorlogo.com/logos/devops-2.svg" alt="DevOps" className="w-full h-full object-contain filter brightness-0 invert" />,
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
      icon: <Shield className="w-full h-full text-white" />,
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
      icon: <GraduationCap className="w-full h-full text-white" />,
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

  // Auto-play only - no manual controls needed

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative min-h-[500px] sm:min-h-[550px] md:min-h-[500px] lg:min-h-[480px] overflow-hidden flex items-center">
      {/* Background with current slide gradient */}
      <div 
        className={`absolute inset-0 ${currentSlideData.background} transition-all duration-1000`}
        style={{ transform: 'translateZ(0)', willChange: 'background' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 lg:py-12 h-full flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center justify-items-center w-full min-h-0">
          
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in-up flex flex-col justify-center items-center lg:items-start self-center w-full max-w-2xl mx-auto lg:mx-0">
            
            {/* Awards Banner - Stable Layout */}
            <div 
              className="w-full mb-3 sm:mb-4 lg:mb-5"
              style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
            >
              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 justify-center lg:justify-start items-center">
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-lg flex-shrink-0">
                  <span className="text-yellow-800 text-xs sm:text-sm">🏆</span>
                  <span className="text-yellow-900 font-bold text-xs sm:text-sm">Award Winning Institute</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-lg flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm">🎖️</span>
                  <span className="text-white font-bold text-xs sm:text-sm">
                    <span className="hidden sm:inline">Best Red Hat Partner Since 2007</span>
                    <span className="sm:hidden">Red Hat Partner 2007</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center lg:justify-start mb-3 lg:mb-4">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm p-2.5 lg:p-3">
                {currentSlideData.icon}
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-2 sm:mb-3 lg:mb-4 text-white drop-shadow-lg">
              {currentSlideData.title}
              <div className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-white/90 mt-1">
                at GRRAS Training Institute
              </div>
            </h1>
            
            <h2 className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-gray-100 mb-4 lg:mb-6 leading-relaxed font-medium">
              {currentSlideData.subtitle}
            </h2>
            
            <p className="text-xs sm:text-sm md:text-base lg:text-base text-gray-200 mb-4 lg:mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {currentSlideData.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 lg:gap-3 mb-4 lg:mb-6">
              {currentSlideData.stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-1 lg:gap-2 bg-white bg-opacity-20 rounded-full px-2 sm:px-3 py-1 lg:py-2 backdrop-blur-sm">
                  <Star className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400 fill-current flex-shrink-0" />
                  <span className="text-white text-xs lg:text-sm font-medium whitespace-nowrap">{stat}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start max-w-md mx-auto lg:max-w-none lg:mx-0 mt-2 pb-4 sm:pb-2"
              style={{ contain: 'layout style' }}
            >
              <Link
                to={currentSlideData.ctaLink}
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl whitespace-nowrap"
              >
                {currentSlideData.cta}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </Link>
              
              <Link
                to="/admissions"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
              >
                Apply Now
                <Award className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </Link>
            </div>
          </div>

          {/* Right Content Card */}
          <div className="hidden lg:flex animate-fade-in-right justify-center items-center">
            <div className="bg-white bg-opacity-15 backdrop-blur-lg rounded-2xl p-6 lg:p-8 border border-white border-opacity-20 shadow-2xl w-full max-w-md">
              {/* Dynamic Content Based on Slide */}
              {currentSlide === 0 && (
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Red Hat Excellence</h3>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm lg:text-lg">95%</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-sm lg:text-base">Success Rate</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Red Hat Certified</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm lg:text-lg">500+</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-sm lg:text-base">Students Certified</div>
                        <div className="text-gray-200 text-xs lg:text-sm">RHCSA & RHCE</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm lg:text-lg">18+</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-sm lg:text-base">Years Experience</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Linux Training</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-black bg-opacity-30 rounded-xl">
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-white mb-1">₹8-15 LPA</div>
                      <div className="text-gray-200 text-xs lg:text-sm">Average Package</div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentSlide === 1 && (
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">AWS Cloud Journey</h3>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-sm lg:text-base">Solutions Architect</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Design scalable cloud solutions</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Settings className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-sm lg:text-base">DevOps Engineer</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Automate cloud infrastructure</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-sm lg:text-base">SysOps Admin</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Manage cloud operations</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-black bg-opacity-30 rounded-xl text-center">
                    <div className="text-lg lg:text-xl font-bold text-white mb-1">₹12-25 LPA</div>
                    <div className="text-gray-200 text-xs lg:text-sm">Cloud Engineer Salary</div>
                  </div>
                </div>
              )}
              
              {currentSlide === 2 && (
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">DevOps Tools Mastery</h3>
                  <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-4 lg:mb-6">
                    <div className="bg-white bg-opacity-20 rounded-lg p-2 lg:p-3 text-center">
                      <div className="text-white font-semibold text-xs lg:text-sm mb-1">Docker</div>
                      <div className="text-gray-200 text-xs">Containerization</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-2 lg:p-3 text-center">
                      <div className="text-white font-semibold text-xs lg:text-sm mb-1">Kubernetes</div>
                      <div className="text-gray-200 text-xs">Orchestration</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-2 lg:p-3 text-center">
                      <div className="text-white font-semibold text-xs lg:text-sm mb-1">Jenkins</div>
                      <div className="text-gray-200 text-xs">CI/CD</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-2 lg:p-3 text-center">
                      <div className="text-white font-semibold text-xs lg:text-sm mb-1">Ansible</div>
                      <div className="text-gray-200 text-xs">Automation</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 lg:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-xs lg:text-sm">Course Completion</span>
                      <span className="text-green-400 font-semibold text-xs lg:text-sm">92%</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-black bg-opacity-30 rounded-xl text-center">
                    <div className="text-lg lg:text-xl font-bold text-white mb-1">₹10-20 LPA</div>
                    <div className="text-gray-200 text-xs lg:text-sm">DevOps Engineer Salary</div>
                  </div>
                </div>
              )}
              
              {currentSlide === 3 && (
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Security Skills</h3>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-sm lg:text-base">Penetration Testing</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Find vulnerabilities</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Settings className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-sm lg:text-base">Network Security</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Secure infrastructure</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-sm lg:text-base">Ethical Hacking</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Legal security testing</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-6 bg-white bg-opacity-20 rounded-xl p-3 lg:p-4">
                    <div className="text-center mb-2 lg:mb-3">
                      <div className="text-white font-semibold text-sm lg:text-base">High Demand Field</div>
                    </div>
                    <div className="text-lg lg:text-2xl font-bold text-center text-white mb-1">₹15-30 LPA</div>
                    <div className="text-gray-200 text-xs lg:text-sm text-center">Security Expert Salary</div>
                  </div>
                </div>
              )}
              
              {currentSlide === 4 && (
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Degree Benefits</h3>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 lg:p-4">
                      <div className="flex items-center gap-2 lg:gap-3 mb-2">
                        <GraduationCap className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-400 flex-shrink-0" />
                        <span className="text-white font-semibold text-sm lg:text-base">BCA Program</span>
                      </div>
                      <div className="text-gray-200 text-xs lg:text-sm">3-year industry-ready degree</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 lg:p-4">
                      <div className="flex items-center gap-2 lg:gap-3 mb-2">
                        <Award className="h-4 w-4 lg:h-5 lg:w-5 text-green-400 flex-shrink-0" />
                        <span className="text-white font-semibold text-sm lg:text-base">100% Placement</span>
                      </div>
                      <div className="text-gray-200 text-xs lg:text-sm">Guaranteed job assistance</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 lg:p-4">
                      <div className="flex items-center gap-2 lg:gap-3 mb-2">
                        <Star className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400 fill-current flex-shrink-0" />
                        <span className="text-white font-semibold text-sm lg:text-base">Industry Skills</span>
                      </div>
                      <div className="text-gray-200 text-xs lg:text-sm">Modern tech curriculum</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-black bg-opacity-30 rounded-xl">
                    <div className="text-center">
                      <div className="text-lg lg:text-xl font-bold text-white mb-1">₹6-12 LPA</div>
                      <div className="text-gray-200 text-xs lg:text-sm">Fresher Package</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


    </section>
  );
};

export default HeroSlider;