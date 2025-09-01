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
      stats: ["100% Certified Trainers", "Real Lab Environment", "Job-Ready Skills"],
      image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxyZWQlMjBoYXQlMjBsaW51eHxlbnwwfHx8fDE3NTY2OTUwNjV8MA&ixlib=rb-4.1.0&q=85"
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
      stats: ["AWS Certified Instructors", "Real Projects", "Industry Placement"],
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxjbG91ZCUyMGNvbXB1dGluZ3xlbnwwfHx8fDE3NTY2OTUwNjV8MA&ixlib=rb-4.1.0&q=85"
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
      stats: ["Industry Tools", "Real Pipelines", "Expert Mentorship"],
      image: "https://images.unsplash.com/photo-1667372393086-9d4001d51cf1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxkZXZvcHN8ZW58MHx8fHwxNzU2Njk1MDY1fDA&ixlib=rb-4.1.0&q=85"
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
      stats: ["Certified Trainers", "Real Attack Scenarios", "Hands-on Labs"],
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f058?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxjeWJlciUyMHNlY3VyaXR5fGVufDB8fHx8MTc1NjY5NTA2NXww&ixlib=rb-4.1.0&q=85"
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
      stats: ["Industry Curriculum", "100% Placement", "Modern Skills"],
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb258ZW58MHx8fHwxNzU2Njk1MDY1fDA&ixlib=rb-4.1.0&q=85"
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
    <section className="relative min-h-[700px] overflow-hidden">
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            {/* Icon */}
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                {currentSlideData.icon}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
              {currentSlideData.title}
            </h1>
            
            <h2 className="text-xl md:text-2xl text-gray-100 mb-6 leading-relaxed font-medium">
              {currentSlideData.subtitle}
            </h2>
            
            <p className="text-lg text-gray-200 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {currentSlideData.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
              {currentSlideData.stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm font-medium">{stat}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to={currentSlideData.ctaLink}
                className="inline-flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                {currentSlideData.cta}
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link
                to="/admissions"
                className="inline-flex items-center justify-center gap-3 border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
              >
                Apply Now
                <Award className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden lg:block animate-fade-in-right">
            <div className="relative">
              <img 
                src={currentSlideData.image} 
                alt={currentSlideData.title}
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
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