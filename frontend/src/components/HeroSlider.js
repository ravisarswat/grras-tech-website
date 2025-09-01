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
      title: "Industry-Ready Degree Programs",
      subtitle: "BCA, MCA with 100% Placement Support",
      description: "Get your degree with modern tech skills and guaranteed placement assistance",
      cta: "Secure Your Future",
      ctaLink: "/courses?category=degree",
      background: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600",
      icon: <GraduationCap className="w-full h-full text-white" />,
      stats: ["Industry Curriculum", "100% Placement", "Modern Skills"]
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
      title: "Master Red Hat Technologies",
      subtitle: "RHCSA, RHCE & OpenShift Certifications",
      description: "Industry-leading Linux and container technologies with hands-on labs",
      cta: "Start Your Red Hat Journey",
      ctaLink: "/courses?category=redhat",
      background: "bg-gradient-to-br from-red-600 via-red-500 to-orange-500",
      icon: <img src="https://www.redhat.com/cms/managed-files/Logo-Red_Hat-Hat_Only-A-Standard-RGB.svg" alt="Red Hat" className="w-full h-full object-contain" />,
      stats: ["100% Certified Trainers", "Real Lab Environment", "Job-Ready Skills"]
    },
    {
      id: 4,
      title: "DevOps Mastery Program",
      subtitle: "Docker, Kubernetes, CI/CD Pipeline",
      description: "Transform your career with modern DevOps practices and automation tools",
      cta: "Transform Your Career",
      ctaLink: "/courses?category=devops",
      background: "bg-gradient-to-br from-blue-600 via-cyan-500 to-green-500",
      icon: <img src="https://cdn-icons-png.flaticon.com/512/919/919853.png" alt="DevOps" className="w-full h-full object-contain filter brightness-0 invert" />,
      stats: ["Industry Tools", "Real Pipelines", "Expert Mentorship"]
    },
    {
      id: 5,
      title: "Cybersecurity & Ethical Hacking",
      subtitle: "Protect Digital Assets, Secure the Future",
      description: "Learn cutting-edge security techniques and ethical hacking methodologies",
      cta: "Become Security Expert",
      ctaLink: "/courses?category=cybersecurity",
      background: "bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600",
      icon: <Shield className="w-full h-full text-white" />,
      stats: ["Certified Trainers", "Real Attack Scenarios", "Hands-on Labs"]
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
    <>
    <section className="relative min-h-[400px] sm:min-h-[450px] md:min-h-[400px] lg:min-h-[380px] overflow-hidden">
      {/* Background with current slide gradient */}
      <div className={`absolute inset-0 ${currentSlideData.background} transition-all duration-1000`}>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Content - Fixed max-width 1200px container */}
      <div className="relative max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20 h-full">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center w-full min-h-full">
          
          {/* Left Content Column */}
          <div className="text-center lg:text-left animate-fade-in-up flex flex-col justify-center order-2 lg:order-1">
            
            {/* Icon - Fixed 64×64 (80×80 on md+) */}
            <div className="flex justify-center lg:justify-start mb-4 lg:mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm p-2">
                {currentSlideData.icon}
              </div>
            </div>

            {/* Headline - wraps within container, no overlap */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3 lg:mb-4 text-white max-w-full">
              {currentSlideData.title}
            </h1>
            
            {/* Subtitle */}
            <h2 className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-gray-100 mb-3 lg:mb-4 leading-relaxed font-medium">
              {currentSlideData.subtitle}
            </h2>
            
            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base lg:text-base text-gray-200 mb-4 lg:mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {currentSlideData.description}
            </p>

            {/* Stats Badges - wrap with consistent 12px gap */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-4 lg:mb-6">
              {currentSlideData.stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-1 lg:gap-2 bg-white bg-opacity-20 rounded-full px-2 sm:px-3 py-1 lg:py-2 backdrop-blur-sm">
                  <Star className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400 fill-current flex-shrink-0" />
                  <span className="text-white text-xs lg:text-sm font-medium whitespace-nowrap">{stat}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start max-w-md mx-auto lg:max-w-none lg:mx-0 pb-16 sm:pb-8">
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

          {/* Right Content Card - order-first on mobile, normal on lg+ */}
          <div className="order-1 lg:order-2 animate-fade-in-right">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-5 md:p-6 lg:p-8 border border-white border-opacity-15 shadow-2xl w-full max-w-md mx-auto">
              
              {/* Dynamic Content Based on First Two Slides */}
              {currentSlide === 0 && (
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Degree Benefits</h3>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold text-sm lg:text-base">BCA Program</div>
                        <div className="text-gray-200 text-xs lg:text-sm">3-year industry-ready degree</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold text-sm lg:text-base">100% Placement</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Guaranteed job assistance</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="h-4 w-4 lg:h-5 lg:w-5 text-white fill-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold text-sm lg:text-base">Industry Skills</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Modern tech curriculum</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-black bg-opacity-30 rounded-xl w-full">
                    <div className="text-center">
                      <div className="text-lg lg:text-xl font-bold text-white mb-1">₹6-12 LPA</div>
                      <div className="text-gray-200 text-xs lg:text-sm">Fresher Package</div>
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
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold text-sm lg:text-base">Solutions Architect</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Design scalable cloud solutions</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Settings className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold text-sm lg:text-base">DevOps Engineer</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Automate cloud infrastructure</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold text-sm lg:text-base">SysOps Admin</div>
                        <div className="text-gray-200 text-xs lg:text-sm">Manage cloud operations</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-black bg-opacity-30 rounded-xl w-full">
                    <div className="text-center">
                      <div className="text-lg lg:text-xl font-bold text-white mb-1">₹12-25 LPA</div>
                      <div className="text-gray-200 text-xs lg:text-sm">Cloud Engineer Salary</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Remaining slides content for other slides */}
              {currentSlide > 1 && (
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Course Excellence</h3>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 lg:p-4">
                      <div className="text-white font-semibold text-sm lg:text-base mb-2">Expert Training</div>
                      <div className="text-gray-200 text-xs lg:text-sm">Industry-certified instructors with real-world experience</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 lg:p-4">
                      <div className="text-white font-semibold text-sm lg:text-base mb-2">Hands-on Practice</div>
                      <div className="text-gray-200 text-xs lg:text-sm">Real projects and lab environments</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 lg:p-4">
                      <div className="text-white font-semibold text-sm lg:text-base mb-2">Career Support</div>
                      <div className="text-gray-200 text-xs lg:text-sm">Job placement assistance and guidance</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-black bg-opacity-30 rounded-xl w-full">
                    <div className="text-center">
                      <div className="text-lg lg:text-xl font-bold text-white mb-1">High Growth</div>
                      <div className="text-gray-200 text-xs lg:text-sm">Career Opportunities</div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Navigation Controls - Outside content area with 16-24px margin */}
    <div className="relative bg-transparent py-4 md:py-6">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-center gap-4">
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="w-10 h-10 lg:w-12 lg:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" />
          </button>

          {/* Dots Indicator - Clickable pagination */}
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-gray-700 w-6 lg:w-8' 
                    : 'bg-gray-400 hover:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="w-10 h-10 lg:w-12 lg:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all backdrop-blur-sm"
          >
            <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={toggleAutoPlay}
            className="w-10 h-10 lg:w-12 lg:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all backdrop-blur-sm ml-2"
          >
            <Play className={`h-4 w-4 lg:h-5 lg:w-5 text-gray-700 ${isPlaying ? 'hidden' : 'block'}`} />
            <div className={`w-2 h-2 bg-gray-700 ${isPlaying ? 'block' : 'hidden'}`}></div>
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default HeroSlider;